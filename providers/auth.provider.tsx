import { useEffect, type ReactNode } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { TokenStorage } from '@/lib/secure-storage';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, hydrated, setTokens, setUser, clearAuth, setHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

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

    if (!accessToken && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (accessToken && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [accessToken, hydrated, segments, router]);

  return <>{children}</>;
}
