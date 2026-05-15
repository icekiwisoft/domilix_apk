import { useEffect, useState } from 'react';
import type { Notification } from '@/types/notification';
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';

interface UseMockNotificationsResult {
  data: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refetch: () => void;
}

export function useMockNotifications(unreadOnly = false): UseMockNotificationsResult {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const result = unreadOnly
        ? MOCK_NOTIFICATIONS.filter((n) => n.read_at === null)
        : [...MOCK_NOTIFICATIONS];
      // Sort: unread first, then by date descending
      result.sort((a, b) => {
        if (!a.read_at && b.read_at) return -1;
        if (a.read_at && !b.read_at) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setData(result);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [unreadOnly, tick]);

  const unreadCount = data.filter((n) => n.read_at === null).length;

  function markAsRead(id: string) {
    setData((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  }

  function markAllAsRead() {
    const now = new Date().toISOString();
    setData((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
  }

  const refetch = () => setTick((t) => t + 1);

  return { data, unreadCount, loading, error, markAsRead, markAllAsRead, refetch };
}
