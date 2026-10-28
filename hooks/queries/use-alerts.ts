import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertsService } from '@/services/alerts.service';
import { useAuthStore } from '@/stores/auth.store';

export function useAlerts() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => AlertsService.list({ per_page: 50 }),
    enabled: !!accessToken,
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AlertsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useUpdateAlertStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) =>
      AlertsService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AlertsService.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
