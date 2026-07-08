import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { AnnouncesService } from '@/services/announces.service';
import type { AnnounceFilters } from '@/types/announce';

export function useAnnounces(filters: AnnounceFilters = {}) {
  return useQuery({
    queryKey: ['announces', filters],
    queryFn: () => AnnouncesService.list(filters),
  });
}

export function useInfiniteAnnounces(filters: Omit<AnnounceFilters, 'page'> = {}, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ['announces-infinite', filters],
    queryFn: ({ pageParam = 1 }) => AnnouncesService.list({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.last_page ? last.page + 1 : undefined,
    enabled: options?.enabled,
  });
}

export function useAnnounce(id: string) {
  return useQuery({
    queryKey: ['announce', id],
    queryFn: () => AnnouncesService.show(id),
    enabled: !!id,
  });
}

export function useCreateAnnounce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => AnnouncesService.create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announces'] });
      qc.invalidateQueries({ queryKey: ['announces-infinite'] });
      qc.invalidateQueries({ queryKey: ['my-announces'] });
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AnnouncesService.toggleLike(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['announce', id] });
      qc.invalidateQueries({ queryKey: ['announces'] });
    },
  });
}

export function useUnlockAnnounce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AnnouncesService.unlock(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['announce', id] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUpdateAnnounce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      AnnouncesService.update(id, formData),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['announce', id] });
      qc.invalidateQueries({ queryKey: ['announces'] });
      qc.invalidateQueries({ queryKey: ['announces-infinite'] });
      qc.invalidateQueries({ queryKey: ['my-announces'] });
    },
  });
}

export function useDeleteAnnounce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AnnouncesService.destroy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announces'] });
      qc.invalidateQueries({ queryKey: ['announces-infinite'] });
      qc.invalidateQueries({ queryKey: ['my-announces'] });
    },
  });
}

export function useMyAnnounces(announcerId: string) {
  return useQuery({
    queryKey: ['my-announces', announcerId],
    queryFn: () => AnnouncesService.list({ AnnouncerId: announcerId }),
    enabled: !!announcerId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
}

export function useCities(params?: Parameters<typeof AnnouncesService.cities>[0]) {
  return useQuery({
    queryKey: ['cities', params],
    queryFn: () => AnnouncesService.cities(params),
    staleTime: 1000 * 60 * 10,
  });
}
