import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { EmptyState } from '@/components/ui/empty-state';
import { LoginGate } from '@/components/ui/login-gate';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAlerts, useDeleteAlert, useUpdateAlertStatus } from '@/hooks/queries/use-alerts';
import { describeAlertFilters } from '@/lib/alert-helpers';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatDateFr } from '@/lib/format-date';
import { useAuthStore } from '@/stores/auth.store';
import type { SearchAlert } from '@/types/alert';

export default function AlertsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isLoading, isError, isFetching, refetch } = useAlerts();
  const updateStatus = useUpdateAlertStatus();
  const deleteAlert = useDeleteAlert();
  const [toDelete, setToDelete] = useState<SearchAlert | null>(null);

  const alerts = data?.data ?? [];

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
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <LoginGate
          title="Connectez-vous pour voir vos alertes"
          subtitle="Chaque alerte est personnelle et n'est jamais visible par les autres utilisateurs."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Retour">
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>Mes alertes</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <EmptyState
          title="Impossible de charger vos alertes."
          ctaLabel="Réessayer"
          onCta={() => refetch()}
          icon={<MaterialIcons name="error-outline" size={36} color={C.primary} />}
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={alerts.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={C.primary} />
          }
          ListHeaderComponent={
            alerts.length > 0 ? (
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 22 }]}>
                Vos recherches sont privées. Domilix vous avertit lorsqu&apos;une nouvelle annonce correspond à vos
                critères.
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              title="Aucune alerte active"
              description="Lancez une recherche. Si elle ne donne aucun résultat, vous pourrez créer une alerte en un clic."
              ctaLabel="Lancer une recherche"
              onCta={() => router.push('/(tabs)/explore')}
              icon={<MaterialIcons name="notifications-none" size={36} color={C.primary} />}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          renderItem={({ item }) => {
            const chips = describeAlertFilters(item.filters);
            const active = item.status === 'active';
            return (
              <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[Typography.labelSm, { color: C.primary }]}>
                      {item.request_type === 'furniture' ? 'Recherche de mobilier' : 'Recherche immobilière'}
                    </Text>
                    <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
                      {item.description || 'Toutes les nouvelles annonces'}
                    </Text>
                  </View>
                  <Switch
                    value={active}
                    onValueChange={() => toggle(item)}
                    accessibilityLabel={active ? 'Mettre en pause cette alerte' : 'Réactiver cette alerte'}
                    color={C.primary}
                  />
                </View>

                {chips.length > 0 && (
                  <View style={styles.chips}>
                    {chips.map((chip) => (
                      <View key={chip} style={[styles.chip, { backgroundColor: C.surfaceContainerHigh }]}>
                        <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>{chip}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.cardBottom}>
                  <Text style={[Typography.caption, { color: active ? '#047857' : C.onSurfaceVariant }]}>
                    {active ? 'Active' : 'En pause'}
                    {item.created_at ? ` · créée le ${formatDateFr(item.created_at)}` : ''}
                  </Text>
                  <Button mode="text" textColor={C.error} compact onPress={() => setToDelete(item)}>
                    Supprimer
                  </Button>
                </View>
              </View>
            );
          }}
        />
      )}

      <Portal>
        <Dialog visible={!!toDelete} onDismiss={() => setToDelete(null)}>
          <Dialog.Title>Supprimer cette alerte ?</Dialog.Title>
          <Dialog.Content>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              Vous ne serez plus averti des nouvelles annonces correspondant à ces critères.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={() => setToDelete(null)}>Annuler</Button>
            <Button mode="text" textColor={C.error} onPress={confirmDelete}>Supprimer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    padding: Spacing.marginMobile,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyContainer: { flexGrow: 1 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
