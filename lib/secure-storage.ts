import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS: 'domilix_access_token',
  REFRESH: 'domilix_refresh_token',
} as const;

export const TokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(KEYS.ACCESS),
  getRefreshToken: () => SecureStore.getItemAsync(KEYS.REFRESH),

  async setTokens(access: string, refresh?: string | null) {
    if (typeof access === 'string' && access) {
      await SecureStore.setItemAsync(KEYS.ACCESS, access);
    }
    if (typeof refresh === 'string' && refresh) {
      await SecureStore.setItemAsync(KEYS.REFRESH, refresh);
    }
  },

  async clearTokens() {
    await SecureStore.deleteItemAsync(KEYS.ACCESS);
    await SecureStore.deleteItemAsync(KEYS.REFRESH);
  },
};
