import { useQuery } from '@tanstack/react-query';
import { BroadcastsService } from '@/services/broadcasts.service';

export function useBroadcasts() {
  return useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => BroadcastsService.list(),
    staleTime: 1000 * 60 * 5,
  });
}
