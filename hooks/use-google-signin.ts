import { useState } from 'react';
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const WEB_CLIENT_ID = '782365365187-9fm5som86olub9tqtcnc7htuj0tj5449.apps.googleusercontent.com';

const MESSAGES = {
  noAccount:
    "Aucun compte Google n'est disponible sur ce téléphone. Ajoutez un compte Google dans les réglages, ou connectez-vous avec votre téléphone ou votre e-mail.",
  playServices:
    'Les services Google Play sont absents ou pas à jour sur ce téléphone. Mettez-les à jour, ou connectez-vous avec votre téléphone ou votre e-mail.',
  generic: 'Connexion avec Google impossible. Réessayez.',
} as const;

type GoogleModule = typeof import('@thoughtbot/react-native-social-auth/google');

let googleModule: GoogleModule | null | undefined;

/**
 * Loads and configures the native Google sign-in module once. Returns null where
 * the native module does not exist (Expo Go, web), which leaves the button disabled
 * instead of crashing the auth screens on import.
 */
function getGoogle(): GoogleModule | null {
  if (googleModule !== undefined) return googleModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const google = require('@thoughtbot/react-native-social-auth/google') as GoogleModule;
    // Patched via patch-package (patches/): the library auto-selects an authorised account, so we force the picker to always show.
    google.GoogleSignIn.configure({ webClientId: WEB_CLIENT_ID });
    googleModule = google;
  } catch {
    googleModule = null;
  }
  return googleModule;
}

/**
 * Maps a rejection of GoogleSignIn.signIn() to a message, or null when the user
 * cancelled (silent return to the screen).
 *
 * The Android module rejects with plain native errors carrying a string `code`
 * (GoogleSignInModule.kt: SIGN_IN_CANCELLED, NO_CREDENTIALS, SIGN_IN_FAILED,
 * ERR_NOT_CONFIGURED, ERR_NO_ACTIVITY), not GoogleSignInError instances, so the
 * code is read directly. Android has no dedicated Play Services code: a missing or
 * outdated Play Services surfaces as SIGN_IN_FAILED carrying androidx.credentials'
 * provider configuration message, recognised by its wording.
 */
function signInErrorMessage(error: unknown): string | null {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
  switch (code) {
    case 'SIGN_IN_CANCELLED':
      return null;
    case 'NO_CREDENTIALS':
      return MESSAGES.noAccount;
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return MESSAGES.playServices;
    case 'SIGN_IN_FAILED':
      return typeof message === 'string' && /provider dependencies|play services/i.test(message)
        ? MESSAGES.playServices
        : MESSAGES.generic;
    default:
      return MESSAGES.generic;
  }
}

/**
 * Forgets the Google account chosen in the app so the account picker shows again
 * on the next sign-in. Never throws: logout must not depend on it.
 */
export async function signOutGoogle(): Promise<void> {
  try {
    await getGoogle()?.GoogleSignIn.signOut();
  } catch {
    // Local credential state only; nothing to recover.
  }
}

export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const google = getGoogle();

  /** Resolves to a Firebase ID token, or null when cancelled or failed (see errorMessage). */
  async function signIn(): Promise<string | null> {
    if (!google) return null;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      let googleIdToken: string;
      try {
        ({ idToken: googleIdToken } = await google.GoogleSignIn.signIn());
      } catch (error) {
        setErrorMessage(signInErrorMessage(error));
        return null;
      }

      try {
        const credential = GoogleAuthProvider.credential(googleIdToken);
        const userCredential = await signInWithCredential(firebaseAuth, credential);
        return await userCredential.user.getIdToken();
      } catch {
        setErrorMessage(MESSAGES.generic);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { signIn, isReady: !!google, isLoading, errorMessage };
}
