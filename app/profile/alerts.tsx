import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import {
  AppText,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  LoadingState,
  LoginGate,
  OfflineState,
  Screen,
  ScreenHeader,
  Switch,
  useToast,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAlerts, useDeleteAlert, useUpdateAlertStatus } from '@/hooks/queries/use-alerts';
import { useThemeColors } from '@/hooks/use-theme-color';
import { describeAlertFilters } from '@/lib/alert-helpers';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatDateFr } from '@/lib/format-date';
import { isNetworkError } from '@/lib/network-error';
import { useAuthStore } from '@/stores/auth.store';
import type { SearchAlert } from '@/types/alert';

export default function AlertsScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isLoading, isError, error, isFetching, refetch } = useAlerts();
  const updateStatus = useUpdateAlertStatus();
  const deleteAlert = useDeleteAlert();
  const [toDelete, setToDelete] = useState<SearchAlert | null>(null);

  const alerts = data?.data ?? [];
  const header = <ScreenHeader title="Mes alertes" />;

  function toggle(alert: SearchAlert) {
    updateStatus.mutate(
      { id: alert.id, status: alert.status === 'active' ? 'inactive' : 'active' },
      { onError: (err) => toast.show(getApiErrorMessage(err, 'Impossible de modifier cette alerte.'), 'error') }
    );
  }

  function confirmDelete() {
    if (!toDelete) return;
    const alert = toDelete;
    setToDelete(null);
    deleteAlert.mutate(alert.id, {
      onError: (err) => toast.show(getApiErrorMessage(err, 'Impossible de supprimer cette alerte.'), 'error'),
    });
  }

  if (!accessToken) {
    return (
      <Screen header={header}>
        <LoginGate
          title="Connectez-vous pour voir vos alertes"
          subtitle="Chaque alerte est personnelle et n'est jamais visible par les autres utilisateurs."
          redirect="/profile/alerts"
        />
      </Screen>
    );
  }

  let body;
  if (isLoading) {
    body = <LoadingState label="Chargement de vos alertes…" media={false} count={3} />;
  } else if (isError) {
    body = isNetworkError(error) ? (
      <OfflineState onRetry={() => refetch()} />
    ) : (
      <ErrorState title="Impossible de charger vos alertes" onRetry={() => refetch()} />
    );
  }

  return (
    <Screen
      scroll={false}
      header={header}
      contentStyle={body ? { flexGrow: 1 } : { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      {body ?? (
        <FlatList
          data={alerts}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={{
            flexGrow: 1,
            padding: Spacing.marginMobile,
            paddingBottom: Spacing.xl,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              colors={[C.primaryContainer]}
              progressBackgroundColor={C.surfaceContainerLowest}
              tintColor={C.primaryContainer}
            />
          }
          ListHeaderComponent={
            alerts.length > 0 ? (
              <AppText color="onSurfaceVariant" style={{ paddingBottom: Spacing.md }}>
                {"Vos recherches sont privées. Domilix vous avertit lorsqu'une nouvelle annonce correspond à vos critères."}
              </AppText>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="notifications-none"
              title="Aucune alerte active"
              description="Lancez une recherche. Si elle ne donne aucun résultat, vous pourrez créer une alerte en un clic."
              actionLabel="Lancer une recherche"
              onAction={() => router.push('/(tabs)/explore')}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          renderItem={({ item }) => {
            const chips = describeAlertFilters(item.filters);
            const active = item.status === 'active';
            return (
              <Card surface="surfaceContainerLowest" outlined style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <View style={{ flex: 1, gap: Spacing.xxs }}>
                    <AppText variant="label" color="link">
                      {item.request_type === 'furniture' ? 'Recherche de mobilier' : 'Recherche immobilière'}
                    </AppText>
                    <AppText variant="bodyStrong">{item.description || 'Toutes les nouvelles annonces'}</AppText>
                  </View>
                  <Switch
                    value={active}
                    onValueChange={() => toggle(item)}
                    accessibilityLabel={active ? 'Mettre en pause cette alerte' : 'Réactiver cette alerte'}
                  />
                </View>

                {chips.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs }}>
                    {chips.map((chip) => (
                      <Badge key={chip} label={chip} variant="neutral" />
                    ))}
                  </View>
                ) : null}

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: Spacing.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm, flexShrink: 1 }}>
                    <Badge label={active ? 'Active' : 'En pause'} variant={active ? 'success' : 'neutral'} status />
                    {item.created_at ? (
                      <AppText variant="caption" color="onSurfaceVariant">
                        {`créée le ${formatDateFr(item.created_at)}`}
                      </AppText>
                    ) : null}
                  </View>
                  <Button variant="text" icon="delete-outline" label="Supprimer" onPress={() => setToDelete(item)} />
                </View>
              </Card>
            );
          }}
        />
      )}

      <Dialog
        visible={!!toDelete}
        title="Supprimer cette alerte ?"
        message="Vous ne serez plus averti des nouvelles annonces correspondant à ces critères."
        confirmLabel="Supprimer"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Screen>
  );
}
