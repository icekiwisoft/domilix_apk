import { client } from './api.client';
import type { Notification } from '@/types/notification';
import type { PaginatedResponse } from '@/types/announce';

// The API returns the text as `message` and does not send `body`.
type RawNotification = Omit<Notification, 'body'> & { body?: string; message?: string };

function normalizeNotification(n: RawNotification): Notification {
  return { ...n, id: String(n.id), body: n.body ?? n.message ?? '' };
}

export const NotificationsService = {
  list: (params?: { unread_only?: string; per_page?: string; page?: string }) =>
    client
      .get<PaginatedResponse<RawNotification>>('/notifications', { params })
      .then((r) => ({
        ...r.data,
        data: r.data.data.map(normalizeNotification),
      })),

  unreadCount: () =>
    client.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  markAsRead: (id: string) =>
    client.post(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    client.post('/notifications/mark-all-read').then((r) => r.data),

  deleteAllRead: () =>
    client.delete('/notifications/read/all').then((r) => r.data),

  destroy: (id: string) =>
    client.delete(`/notifications/${id}`).then((r) => r.data),
};
