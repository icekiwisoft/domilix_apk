import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubscriptionsService } from '@/services/subscriptions.service';
import { useAuthStore } from '@/stores/auth.store';

export function useSubscriptions() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: SubscriptionsService.list,
    enabled: !!accessToken,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { plan_name: string; method: string; payment_info: { phone_number: string } }) =>
      SubscriptionsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
