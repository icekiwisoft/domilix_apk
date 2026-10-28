import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GeoapifyError, GeoapifyService } from '@/services/geoapify.service';

function useDebouncedValue(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

export function useAddressSearch(query: string, enabled = true, type?: 'city') {
  const debouncedQuery = useDebouncedValue(query.trim());

  return useQuery({
    queryKey: ['geoapify-address-search', type ?? 'address', debouncedQuery],
    queryFn: ({ signal }) => GeoapifyService.search(debouncedQuery, signal, type),
    enabled: enabled && debouncedQuery.length >= 3,
    staleTime: 1000 * 30,
    // Run even when React Query thinks the device is offline. With the default
    // 'online' mode the query would sit paused and the field would show
    // nothing; here fetch fails at once and GeoapifyService turns it into the
    // "Pas de connexion internet … saisissez l'adresse manuellement" error.
    networkMode: 'always',
    // Retrying a quota (429), a missing key or an offline request only burns
    // more of the Geoapify quota; the next keystroke tries again anyway.
    retry: (count, err) => !(err instanceof GeoapifyError) && count < 2,
  });
}
