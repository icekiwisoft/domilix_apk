import { useEffect, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const WEB_CLIENT_ID = '782365365187-9fm5som86olub9tqtcnc7htuj0tj5449.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '782365365187-ch9alrtjojfddna064pjepskrujm0ol1.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });
  const [isLoading, setIsLoading] = useState(false);
  const resolveSignIn = useRef<((idToken: string | null) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!response || !resolveSignIn.current) return;

    const resolve = resolveSignIn.current;
    resolveSignIn.current = null;
    const idToken = response.type === 'success'
      ? response.params.id_token ?? response.authentication?.idToken ?? null
      : null;

    void resolve(idToken).finally(() => setIsLoading(false));
  }, [response]);

  function signIn(): Promise<string | null> {
    setIsLoading(true);
    return new Promise((resolve) => {
      resolveSignIn.current = async (googleIdToken) => {
        if (!googleIdToken) {
          resolve(null);
          return;
        }

        try {
          const credential = GoogleAuthProvider.credential(googleIdToken);
          const userCredential = await signInWithCredential(firebaseAuth, credential);
          resolve(await userCredential.user.getIdToken());
        } catch {
          resolve(null);
        }
      };

      promptAsync().catch(() => {
        const pendingResolve = resolveSignIn.current;
        resolveSignIn.current = null;
        setIsLoading(false);
        pendingResolve?.(null);
      });
    });
  }

  return { signIn, isReady: !!request, isLoading };
}
