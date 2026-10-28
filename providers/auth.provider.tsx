import { useEffect, type ReactNode } from 'react';
import { useGlobalSearchParams, usePathname, useSegments, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { TokenStorage } from '@/lib/secure-storage';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    accessToken,
    hydrated,
    sessionExpired,
    setTokens,
    setUser,
    expireSession,
    acknowledgeSessionExpired,
    setHydrated,
  } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Hydrate tokens on cold start ─────────────────────────────────────────────
  // The session decision rests on the locally stored token only, so the app
  // (and the splash screen, see app/_layout.tsx) never waits for the network.
  // The profile is then fetched in the background; only a confirmed auth
  // failure logs the user out, never a network error or a slow server.
  useEffect(() => {
    async function hydrate() {
      let access: string | null = null;
      try {
        const [storedAccess, refresh] = await Promise.all([
          TokenStorage.getAccessToken(),
          TokenStorage.getRefreshToken(),
        ]);
        access = storedAccess;
        if (access) setTokens(access, refresh);
      } catch {
        // Unreadable secure storage: start signed out, but keep what is stored.
      } finally {
        setHydrated();
      }

      if (!access) return;
      try {
        const user = await AuthService.me();
        setUser(user);
        // Sync the full user (with announcer) into React Query cache so
        // useMe() returns correct data without waiting for a background refetch
        queryClient.setQueryData(['me'], user);
      } catch (err) {
        // A 401 here means the refresh in api.client.ts succeeded but the new
        // token was still refused. A rejected refresh already cleared the
        // session there. Anything else (offline, timeout, 5xx) keeps it.
        if (isAxiosError(err) && err.response?.status === 401) expireSession();
      }
    }

    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    // The server refused the session (B-05): back to the login screen with a
    // short message. The flag is cleared right away, so this runs once per
    // expiry and "Explorer les annonces sans compte" is not redirected again.
    if (sessionExpired) {
      acknowledgeSessionExpired();
      // The cached profile belongs to the refused session.
      queryClient.removeQueries({ queryKey: ['me'] });
      if (!inAuthGroup) {
        // Keep the user's place (pathname + query, without the dynamic segments
        // already in the pathname) so login can send them back to it.
        const query = Object.entries(searchParams)
          .filter(([, v]) => typeof v === 'string' && !pathname.split('/').includes(encodeURIComponent(v)) && !pathname.split('/').includes(v))
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
          .join('&');
        const redirect = pathname === '/' ? undefined : query ? `${pathname}?${query}` : pathname;
        router.replace({
          pathname: '/(auth)/login',
          params: { reason: 'session-expired', ...(redirect ? { redirect } : {}) },
        });
      }
      return;
    }

    // Authenticated users landing on auth screens are sent to the app
    if (accessToken && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // Unauthenticated users can browse freely — protected routes handle their own gate
  }, [accessToken, hydrated, sessionExpired, segments, pathname, searchParams, router, acknowledgeSessionExpired, queryClient]);

  return <>{children}</>;
}
