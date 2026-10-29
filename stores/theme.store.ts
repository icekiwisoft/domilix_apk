import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'domilix_theme_preference';

interface ThemeState {
  preference: ThemePreference;
  /** The stored preference has been read (or found missing). */
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * Forces the native side (Android uiMode / iOS userInterfaceStyle) to the
 * preference, so everything the platform resolves by itself (status bar
 * "auto", theme attributes, native views) follows the same scheme as our
 * tokens instead of the system's. 'system' gives control back to the OS.
 */
function applyNativeScheme(preference: ThemePreference) {
  if (process.env.EXPO_OS === 'web') return;
  Appearance.setColorScheme(preference === 'system' ? null : preference);
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  hydrated: false,
  setPreference: (preference) => {
    applyNativeScheme(preference);
    set({ preference });
    AsyncStorage.setItem(STORAGE_KEY, preference);
  },
}));

let hydrating = false;

export function hydrateThemeStore() {
  if (hydrating) return;
  hydrating = true;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        applyNativeScheme(stored);
        useThemeStore.setState({ preference: stored });
      }
    })
    .catch(() => {})
    .finally(() => useThemeStore.setState({ hydrated: true }));
}
