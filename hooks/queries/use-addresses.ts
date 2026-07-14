import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GeoapifyService } from '@/services/geoapify.service';

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
  });
}
