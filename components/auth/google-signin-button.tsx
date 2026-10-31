import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { goAfterAuth } from '@/components/auth/go-after-auth';
import { Banner, Button } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useGoogleSignIn } from '@/hooks/use-google-signin';
import { useFirebaseLogin } from '@/hooks/queries/use-auth-queries';

interface GoogleSignInButtonProps {
  redirectTo?: string;
  /** The screen to go back to is still under this one (see goAfterAuth). */
  targetBelow?: boolean;
  /** "Continuer avec Google" on sign-in, "S'inscrire avec Google" on sign-up. */
  label?: string;
}

/**
 * Google sign-in button in Google's official style (white or #131314 surface,
 * grey outline, multicolour logo: the kit Button's `google` variant), as
 * required by Google's branding guidelines.
 */
export function GoogleSignInButton({ redirectTo, targetBelow = false, label = 'Continuer avec Google' }: GoogleSignInButtonProps) {
  const router = useRouter();
  const { signIn, isReady, isLoading: isGoogleLoading, errorMessage: googleError } = useGoogleSignIn();
  const firebaseLogin = useFirebaseLogin();
  const [error, setError] = useState(false);
  // Covers the whole chain signIn -> backend login, so the button never re-enables between the two.
  const busyRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);

  function release() {
    busyRef.current = false;
    setIsBusy(false);
  }

  async function handlePress() {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsBusy(true);
    setError(false);
    let idToken: string | null = null;
    try {
      idToken = await signIn();
    } finally {
      if (!idToken) release();
    }
    if (!idToken) return;
    firebaseLogin.mutate(idToken, {
      onSuccess: () => goAfterAuth(router, redirectTo, targetBelow),
      onError: () => setError(true),
      onSettled: release,
    });
  }

  const isLoading = isBusy || isGoogleLoading || firebaseLogin.isPending;

  return (
    <View style={{ gap: Spacing.sm }}>
      <Button
        variant="google"
        size="lg"
        fullWidth
        label={label}
        onPress={handlePress}
        loading={isLoading}
        disabled={!isReady}
      />

      {error || googleError ? (
        <Banner tone="error">{error ? 'Connexion avec Google impossible. Réessayez.' : (googleError ?? '')}</Banner>
      ) : null}
    </View>
  );
}
