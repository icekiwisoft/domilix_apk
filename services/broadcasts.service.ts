import { client } from './api.client';
import type { Broadcast } from '@/types/announce';

export const BroadcastsService = {
  list: (include_inactive = false) =>
    client
      .get<Broadcast[]>('/broadcasts', { params: { include_inactive } })
      .then((r) => r.data),

  show: (id: string) =>
    client.get<Broadcast>(`/broadcasts/${id}`).then((r) => r.data),
};
