import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { hydrateThemeStore, useThemeStore } from '@/stores/theme.store';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    hydrateThemeStore();
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return 'light';
  if (preference === 'light' || preference === 'dark') return preference;
  return systemScheme;
}
