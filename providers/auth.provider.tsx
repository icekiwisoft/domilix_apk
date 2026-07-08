import { useEffect, type ReactNode } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { TokenStorage } from '@/lib/secure-storage';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, hydrated, setTokens, setUser, clearAuth, setHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Hydrate tokens + validate session on cold start ──────────────────────────
  useEffect(() => {
    async function hydrate() {
      try {
        const [access, refresh] = await Promise.all([
          TokenStorage.getAccessToken(),
          TokenStorage.getRefreshToken(),
        ]);

        if (access) {
          setTokens(access, refresh);
          const user = await AuthService.me();
          setUser(user);
          // Sync the full user (with announcer) into React Query cache so
          // useMe() returns correct data without waiting for a background refetch
          queryClient.setQueryData(['me'], user);
        }
      } catch {
        clearAuth();
      } finally {
        setHydrated();
      }
    }

    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Authenticated users landing on auth screens are sent to the app
    if (accessToken && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // Unauthenticated users can browse freely — protected routes handle their own gate
  }, [accessToken, hydrated, segments, router]);

  return <>{children}</>;
}
