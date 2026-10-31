import { create } from 'zustand';
import type { User } from '@/types/auth';
import { TokenStorage } from '@/lib/secure-storage';
import { useCreateListingStore } from '@/stores/create-listing.store';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  /** Set when the server refused a session that existed; AuthProvider sends the user to the login screen. */
  sessionExpired: boolean;

  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh?: string | null) => void;
  /** Explicit sign-out: clears the session without any message. */
  clearAuth: () => void;
  /**
   * The server refused the session (refresh refused, or 401 right after a refresh).
   * Clears it and raises `sessionExpired` only if there was a session, so a guest
   * who never signed in is never sent to the login screen.
   */
  expireSession: () => void;
  acknowledgeSessionExpired: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  sessionExpired: false,

  setUser: (user) => set({ user }),

  setTokens: (access, refresh) => {
    if (typeof access !== 'string' || !access) return;
    set({ accessToken: access, refreshToken: refresh ?? null });
    TokenStorage.setTokens(access, refresh);
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    TokenStorage.clearTokens();
    // The listing draft belongs to the account that typed it.
    useCreateListingStore.getState().resetDraft();
  },

  expireSession: () => {
    const hadSession = !!get().accessToken;
    set({ user: null, accessToken: null, refreshToken: null, sessionExpired: hadSession });
    TokenStorage.clearTokens();
    useCreateListingStore.getState().resetDraft();
  },

  acknowledgeSessionExpired: () => set({ sessionExpired: false }),

  setHydrated: () => set({ hydrated: true }),
}));
