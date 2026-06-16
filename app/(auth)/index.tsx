import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { AppStorage } from '@/lib/app-storage';

export default function AuthIndex() {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    AppStorage.hasSeenOnboarding().then((val) => {
      setSeen(!!val);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  // Onboarding already seen → drop the user into the app (guest mode)
  // AuthProvider handles the redirect to /(tabs) if a token exists
  return <Redirect href={seen ? '/(tabs)' : '/(auth)/onboarding'} />;
}
