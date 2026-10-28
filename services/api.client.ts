import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import { decodeJwtPayload } from '@/lib/decode-token';
import { TokenStorage } from '@/lib/secure-storage';
import { useAuthStore } from '@/stores/auth.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.domilix.com';

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Accept': 'application/json' },
});

const REFRESH_PATH = '/auth/refresh';

// ── Request: attach Bearer token ─────────────────────────────────────────────
// Not on the refresh call: with an Authorization header and no body token the
// backend takes its access-token branch instead of verifying the refresh token.
client.interceptors.request.use((config) => {
  if (config.url?.includes(REFRESH_PATH)) return config;
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: silent 401 → refresh → retry ───────────────────────────────────
let isRefreshing = false;
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void };
let queue: QueueItem[] = [];
// Consecutive 5xx answers to a refresh. The backend answers 500 (not 401) when
// jwt.verify rejects the refresh token, so a session that keeps getting 5xx
// from refresh is dead even if the token does not look expired locally.
let refreshServerErrors = 0;
const MAX_REFRESH_SERVER_ERRORS = 3;

function isExpiredOrUnreadable(token: string): boolean {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp !== 'number' || exp * 1000 <= Date.now();
}

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
      original?.url?.includes(REFRESH_PATH)
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

    let refreshToken: string | null = null;
    try {
      refreshToken =
        useAuthStore.getState().refreshToken ?? (await TokenStorage.getRefreshToken());
      if (!refreshToken) throw new Error('no_refresh_token');

      // Body token → the backend verifies its signature and revocation, revokes
      // it and issues a new pair (authorisation.token / authorisation.refresh_token).
      const { data } = await client.post<Record<string, unknown>>(REFRESH_PATH, {
        refresh_token: refreshToken,
      });

      const auth = data.authorisation as Record<string, unknown> | undefined;
      const newAccess = (
        auth?.token ?? data.access_token ?? data.token ?? data.accessToken
      ) as string | undefined;
      const newRefresh = (
        auth?.refresh_token ?? data.refresh_token ?? data.refreshToken
      ) as string | undefined;
      if (!newAccess) throw new Error('no_access_token_in_refresh_response');

      refreshServerErrors = 0;
      // The old refresh token is now revoked: storing the new one is mandatory.
      useAuthStore.getState().setTokens(newAccess, newRefresh);
      drainQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return client(original);
    } catch (err) {
      drainQueue(err, null);
      // Log out only when the server refused the refresh (400/401/403) or there
      // is nothing to refresh with. Offline, timeout and 429 keep the session.
      const status = isAxiosError(err) ? err.response?.status ?? 0 : 0;
      let refused = !isAxiosError(err) || [400, 401, 403].includes(status);
      // 5xx: the server was reachable (it just answered 401) but could not
      // verify the refresh token. Give up at once if the token is expired, or
      // after a few in a row, so the user is not stuck half signed in.
      if (status >= 500) {
        refreshServerErrors += 1;
        if (
          (refreshToken && isExpiredOrUnreadable(refreshToken)) ||
          refreshServerErrors >= MAX_REFRESH_SERVER_ERRORS
        ) {
          refused = true;
        }
      } else {
        refreshServerErrors = 0;
      }
      if (refused) {
        refreshServerErrors = 0;
        useAuthStore.getState().clearAuth();
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
