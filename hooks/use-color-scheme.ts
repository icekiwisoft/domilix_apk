import { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { hydrateThemeStore, useThemeStore } from '@/stores/theme.store';

export function useColorScheme() {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    hydrateThemeStore();
  }, []);

  if (preference === 'light' || preference === 'dark') return preference;
  return systemScheme;
}
