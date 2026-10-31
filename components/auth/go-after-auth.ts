import type { Router } from 'expo-router';

/**
 * Leaves an auth screen after a successful sign-in.
 *
 * `targetBelow` is true when the screen the user came from (e.g. the listing
 * behind "Débloquer") is still right under the auth screen: going back to it
 * keeps the stack as it was, where `replace` stacked a second copy of it and
 * needed one extra Back press. When the auth screen replaced that screen
 * (session expiry), the target is not in the stack and is opened in place.
 */
export function goAfterAuth(router: Router, redirect: string | undefined, targetBelow: boolean) {
  if (!redirect) return router.replace('/(tabs)');
  if (targetBelow && router.canGoBack()) return router.dismissTo(redirect as never);
  return router.replace(redirect as never);
}
