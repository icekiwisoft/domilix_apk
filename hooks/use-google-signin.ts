import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const WEB_CLIENT_ID = '782365365187-9fm5som86olub9tqtcnc7htuj0tj5449.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '782365365187-ch9alrtjojfddna064pjepskrujm0ol1.apps.googleusercontent.com';

export function useGoogleSignIn() {
  const [request, , promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });
  const [isLoading, setIsLoading] = useState(false);

  async function signIn(): Promise<string | null> {
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') return null;

      const googleIdToken = result.params.id_token ?? result.authentication?.idToken;
      if (!googleIdToken) return null;

      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await signInWithCredential(firebaseAuth, credential);
      return await userCredential.user.getIdToken();
    } finally {
      setIsLoading(false);
    }
  }

  return { signIn, isReady: !!request, isLoading };
}
