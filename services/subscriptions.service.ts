import { client } from './api.client';
import type { Subscription } from '@/types/notification';

export const SubscriptionsService = {
  list: () =>
    client.get<Subscription[]>('/subscriptions').then((r) => r.data),

  show: (id: string) =>
    client.get<Subscription>(`/subscriptions/${id}`).then((r) => r.data),

  create: (dto: { plan_name: string; method: string; payment_info: { phone_number: string } }) =>
    client.post<Subscription>('/subscriptions', dto).then((r) => r.data),

  destroy: (id: string) =>
    client.delete(`/subscriptions/${id}`).then((r) => r.data),
};
