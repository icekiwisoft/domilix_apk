import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { AuthService } from '@/services/auth.service';
import { SubscriptionsService } from '@/services/subscriptions.service';
import { useAuthStore } from '@/stores/auth.store';
import { usePaymentStore } from '@/stores/payment.store';

// A persisted queue survives navigation, closing the checkout and app restarts.
export function PaymentObserver() {
  const userId = useAuthStore((s) => s.user?.id);
  const token = useAuthStore((s) => s.accessToken);
  const pending = usePaymentStore((s) => s.pending);
  const queryClient = useQueryClient();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!token || !userId) return;
    let cancelled = false;
    let checking = false;
    let refreshing = false;
    async function refreshBalance() {
      if (cancelled || refreshing || AppState.currentState !== 'active') return;
      refreshing = true;
      try {
        const user = await AuthService.me();
        if (!cancelled && String(useAuthStore.getState().user?.id) === String(userId)) {
          useAuthStore.getState().setUser(user);
          queryClient.setQueryData(['me'], user);
        }
      } catch { /* Recheck the balance after reconnection. */ }
      finally { refreshing = false; }
    }
    async function check() {
      if (checking || cancelled || AppState.currentState !== 'active') return;
      checking = true;
      try {
        for (const payment of pending.filter((p) => p.userId === String(userId))) {
          const result = await SubscriptionsService.paymentStatus(payment.id);
          if (cancelled || String(useAuthStore.getState().user?.id) !== String(userId)) return;
          if (result.status === 'pending') continue;
          if (result.status === 'completed') {
            // Refresh both sources: several screens read the auth store directly.
            const user = await AuthService.me();
            if (cancelled || String(useAuthStore.getState().user?.id) !== String(userId)) return;
            useAuthStore.getState().setUser(user);
            queryClient.setQueryData(['me'], user);
            void queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toastRef.current.show('Paiement confirmé. Vos Domicoins sont disponibles.', 'success');
          } else {
            toastRef.current.show('Le paiement a échoué. Aucun Domicoin ajouté.', 'error');
          }
          usePaymentStore.getState().remove(payment.id);
        }
      } catch {
        // Keep pending payments for retry after a network outage or delayed webhook.
      } finally { checking = false; }
    }
    void check();
    const timer = setInterval(() => { void check(); }, 3000);
    const balanceTimer = setInterval(() => { void refreshBalance(); }, 15000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') { void check(); void refreshBalance(); }
    });
    return () => { cancelled = true; clearInterval(timer); clearInterval(balanceTimer); subscription.remove(); };
  }, [userId, token, pending, queryClient]);
  return null;
}
