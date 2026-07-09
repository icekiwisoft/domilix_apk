import { useMutation, useQuery, useQueryClient, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { AnnouncesService } from '@/services/announces.service';
import type { Announce, AnnounceFilters, PaginatedResponse } from '@/types/announce';

function flipLiked(id: string) {
  return (a: Announce): Announce =>
    String(a.id) !== id
      ? a
      : {
          ...a,
          liked: !a.liked,
          likes_count: a.likes_count != null ? a.likes_count + (a.liked ? -1 : 1) : a.likes_count,
        };
}

export function useAnnounces(filters: AnnounceFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['announces', filters],
    queryFn: () => AnnouncesService.list(filters),
    enabled: options?.enabled,
  });
}

export function useInfiniteAnnounces(filters: Omit<AnnounceFilters, 'page'> = {}, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ['announces-infinite', filters],
    queryFn: ({ pageParam = 1 }) => AnnouncesService.list({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined,
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
    onMutate: async (id: string) => {
      // The API returns numeric announce ids on some payloads even though our
      // types declare them as string — normalize so cache keys/comparisons
      // (built from route params, always strings) reliably match.
      const key = String(id);
      await qc.cancelQueries({ queryKey: ['announce', key] });

      const previousAnnounce = qc.getQueryData<Announce>(['announce', key]);
      const flip = flipLiked(key);

      if (previousAnnounce) {
        qc.setQueryData<Announce>(['announce', key], flip(previousAnnounce));
      }

      qc.setQueriesData<PaginatedResponse<Announce>>({ queryKey: ['announces'] }, (old) =>
        old ? { ...old, data: old.data.map(flip) } : old
      );

      qc.setQueriesData<InfiniteData<PaginatedResponse<Announce>>>({ queryKey: ['announces-infinite'] }, (old) =>
        old ? { ...old, pages: old.pages.map((p) => ({ ...p, data: p.data.map(flip) })) } : old
      );

      return { previousAnnounce };
    },
    onSuccess: (data, id) => {
      const key = String(id);
      // Reconcile with the toggle endpoint's own response — trusted over a
      // possible refetch of GET /announces/{id}, whose "liked" field has been
      // observed to lag/not reflect the just-toggled state on some backends.
      if (typeof data?.liked === 'boolean') {
        qc.setQueryData<Announce>(['announce', key], (old) =>
          old ? { ...old, liked: data.liked } : old
        );
      }
      qc.invalidateQueries({ queryKey: ['announces'] });
      qc.invalidateQueries({ queryKey: ['announces-infinite'] });
    },
    onError: (_err, id, context) => {
      if (context?.previousAnnounce) {
        qc.setQueryData(['announce', String(id)], context.previousAnnounce);
      }
      qc.invalidateQueries({ queryKey: ['announces'] });
      qc.invalidateQueries({ queryKey: ['announces-infinite'] });
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
