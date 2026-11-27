import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppText, Banner, Button, Card, ErrorState, PriceTag, Screen, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getApiErrorMessage } from '@/lib/api-error';
import { AdActivityService, type AdOrder } from '@/services/ad-activity.service';
import { useAuthStore } from '@/stores/auth.store';

export default function OrdersScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const orders = useQuery({
    queryKey: ['ad-orders', user?.id],
    queryFn: AdActivityService.orders,
    enabled: !!user,
    gcTime: 0,
  });
  const change = useMutation({
    mutationFn: async ({ order, remove }: { order: AdOrder; remove?: boolean }) => {
      if (remove) await AdActivityService.remove(order.id);
      else await AdActivityService.prepare(order.id);
    },
    onSettled: () => orders.refetch(),
  });
  const items = orders.data ?? [];

  function renderOrder(order: AdOrder) {
    return (
      <Card key={order.id} outlined>
        <AppText variant="bodyStrong">{order.title}</AppText>
        {order.city ? <AppText variant="bodySm">{order.city}</AppText> : null}
        <AppText variant="label" color="onSurfaceVariant">{order.ad_type === 'location' ? 'Location' : 'Achat'}</AppText>
        <PriceTag amount={Number(order.price)} currency={order.devise} period={order.period} size="sm" />
        <Button variant="text" label="Voir l’annonce" onPress={() => router.push(`/announces/${order.ad_id}`)} />
        {order.status === 'cart' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            <Button variant="secondary" label="Retirer" disabled={change.isPending}
              onPress={() => change.mutate({ order, remove: true })} />
            <Button label="Préparer la commande" disabled={change.isPending}
              onPress={() => change.mutate({ order })} />
          </View>
        ) : (
          <>
            <AppText variant="bodySm" selectable>Référence : {order.id}</AppText>
            <AppText variant="label" color="onSurfaceVariant">En attente du paiement</AppText>
          </>
        )}
      </Card>
    );
  }

  return (
    <Screen header={<ScreenHeader title="Panier et commandes" />} contentStyle={{ gap: Spacing.md }}>
      <Banner>Le paiement n’est pas encore disponible. Préparer une commande ne réserve pas le bien et ne débite aucun montant.</Banner>
      {!user ? <AppText>Connectez-vous pour consulter vos commandes.</AppText> :
        orders.isError ? <ErrorState title="Impossible de charger le panier" onRetry={() => orders.refetch()} /> :
        orders.isPending ? <AppText>Chargement…</AppText> : (
          <>
            {change.isError ? <Banner tone="error">{getApiErrorMessage(change.error, 'Impossible de modifier la commande.')}</Banner> : null}
            <AppText variant="bodyStrong" accessibilityRole="header">Panier</AppText>
            {items.some((item) => item.status === 'cart')
              ? items.filter((item) => item.status === 'cart').map(renderOrder)
              : <AppText color="onSurfaceVariant">Votre panier est vide.</AppText>}
            <AppText variant="bodyStrong" accessibilityRole="header">Mes commandes</AppText>
            {items.some((item) => item.status === 'pending_payment')
              ? items.filter((item) => item.status === 'pending_payment').map(renderOrder)
              : <AppText color="onSurfaceVariant">Aucune commande préparée.</AppText>}
          </>
        )}
    </Screen>
  );
}
