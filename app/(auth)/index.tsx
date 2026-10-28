import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function AuthIndex() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Render nothing (the splash is still up) until the stored token has been
  // read; a signed-in user is then sent to the tabs by AuthProvider's guard
  // without the login screen ever being mounted.
  if (!hydrated || accessToken) return null;
  return <Redirect href="/(auth)/login" />;
}
