import { useQuery } from '@tanstack/react-query';
import { AnnouncersService } from '@/services/announcers.service';

export function useAnnouncers(page?: number) {
  return useQuery({
    queryKey: ['announcers', page],
    queryFn: () => AnnouncersService.list(page),
  });
}

export function useAnnouncer(id: string) {
  return useQuery({
    queryKey: ['announcer', id],
    queryFn: () => AnnouncersService.show(id),
    enabled: !!id,
  });
}
