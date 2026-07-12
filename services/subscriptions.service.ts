import { client } from './api.client';
import type { Subscription, SubscriptionPlan } from '@/types/notification';

export const SubscriptionsService = {
  plans: () =>
    client.get<SubscriptionPlan[]>('/subscriptions/plans').then((r) => r.data),

  list: () =>
    client.get<Subscription[]>('/subscriptions').then((r) => r.data),

  show: (id: string) =>
    client.get<Subscription>(`/subscriptions/${id}`).then((r) => r.data),

  // POST /subscriptions doesn't create the subscription synchronously — it
  // triggers a Campay mobile money prompt on the buyer's phone. The actual
  // Subscription record (and credit grant) is only created later via the
  // Campay webhook once the user confirms the payment.
  create: (dto: { plan_name: string; method: string; payment_info: { phone_number: string } }) =>
    client
      .post<{ message: string; payment_id: string; provider: string }>('/subscriptions', dto)
      .then((r) => r.data),

  destroy: (id: string) =>
    client.delete(`/subscriptions/${id}`).then((r) => r.data),
};
