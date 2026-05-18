import { useQuery } from '@tanstack/react-query';
import { AddressesService } from '@/services/addresses.service';

export function useAddressSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['address-search', query],
    queryFn: () =>
      AddressesService.search({ query, country: 'cm', language: 'fr', autocomplete: true }),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 30,
  });
}
