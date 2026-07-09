import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'domilix_theme_preference';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  setPreference: (preference) => {
    set({ preference });
    AsyncStorage.setItem(STORAGE_KEY, preference);
  },
}));

let hydrated = false;

export function hydrateThemeStore() {
  if (hydrated) return;
  hydrated = true;
  AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      useThemeStore.setState({ preference: stored });
    }
  });
}
