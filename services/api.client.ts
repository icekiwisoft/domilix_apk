import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import { TokenStorage } from '@/lib/secure-storage';
import { useAuthStore } from '@/stores/auth.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.domilix.com';

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Accept': 'application/json' },
});

// ── Request: attach Bearer token ─────────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: silent 401 → refresh → retry ───────────────────────────────────
let isRefreshing = false;
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void };
let queue: QueueItem[] = [];

function drainQueue(err: unknown, token: string | null) {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  queue = [];
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: InternalAxiosRequestConfig & { _retry?: boolean } = error.config;

    // The refresh call itself must never wait in the queue for its own result
    // (it would hang forever): its 401 is rejected right away.
    if (
      error.response?.status !== 401 ||
      original?._retry ||
      original?.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => queue.push({ resolve, reject }))
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('no_refresh_token');

      const { data } = await client.post<Record<string, unknown>>(
        '/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      const auth = data.authorisation as Record<string, unknown> | undefined;
      const newAccess = (
        auth?.token ?? data.access_token ?? data.token ?? data.accessToken
      ) as string | undefined;
      const newRefresh = (
        auth?.refresh_token ?? data.refresh_token ?? data.refreshToken
      ) as string | undefined;
      if (!newAccess) throw new Error('no_access_token_in_refresh_response');

      useAuthStore.getState().setTokens(newAccess, newRefresh);
      drainQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return client(original);
    } catch (err) {
      drainQueue(err, null);
      // Log out only when the server refused the refresh (400/401/403) or there
      // is nothing to refresh with. Offline, timeout, 429 or 5xx keep the session.
      const refused = !isAxiosError(err) || [400, 401, 403].includes(err.response?.status ?? 0);
      if (refused) useAuthStore.getState().clearAuth();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
