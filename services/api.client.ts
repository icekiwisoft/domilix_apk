import axios, { type InternalAxiosRequestConfig } from 'axios';
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

    if (error.response?.status !== 401 || original?._retry) {
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
      useAuthStore.getState().clearAuth();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
