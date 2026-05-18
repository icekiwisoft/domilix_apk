import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificationsService } from '@/services/notifications.service';
import { useAuthStore } from '@/stores/auth.store';

export function useNotifications(params?: { unread_only?: string; per_page?: string; page?: string }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => NotificationsService.list(params),
    enabled: !!accessToken,
  });
}

export function useUnreadCount() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: NotificationsService.unreadCount,
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationsService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: NotificationsService.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationsService.destroy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
