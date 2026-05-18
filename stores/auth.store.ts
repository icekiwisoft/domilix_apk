import { create } from 'zustand';
import type { User } from '@/types/auth';
import { TokenStorage } from '@/lib/secure-storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;

  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh?: string | null) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,

  setUser: (user) => set({ user }),

  setTokens: (access, refresh) => {
    if (typeof access !== 'string' || !access) return;
    set({ accessToken: access, refreshToken: refresh ?? null });
    TokenStorage.setTokens(access, refresh);
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    TokenStorage.clearTokens();
  },

  setHydrated: () => set({ hydrated: true }),
}));
