import { useState } from 'react';
import { RefreshControl, SectionList, View } from 'react-native';

import { NotifGroup } from '@/components/notifications/notif-group';
import { NotifItem } from '@/components/notifications/notif-item';
import { NotifSkeleton } from '@/components/notifications/notif-skeleton';
import { Button, EmptyState, ErrorState, LoginGate, OfflineState, Screen, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDeleteNotification, useMarkAllRead, useMarkAsRead, useNotifications } from '@/hooks/queries/use-notifications';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isNetworkError } from '@/lib/network-error';
import { useAuthStore } from '@/stores/auth.store';
import type { Notification } from '@/types/notification';

function groupByDate(notifs: Notification[]): { title: string; data: Notification[] }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: Record<string, Notification[]> = {
    "Aujourd'hui": [],
    Hier: [],
    'Plus ancien': [],
  };

  for (const n of notifs) {
    const d = new Date(n.created_at);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups["Aujourd'hui"].push(n);
    else if (d.getTime() === yesterday.getTime()) groups['Hier'].push(n);
    else groups['Plus ancien'].push(n);
  }

  return Object.entries(groups)
    .filter(([, data]) => data.length > 0)
    .map(([title, data]) => ({ title, data }));
}

export default function NotificationsScreen() {
  const C = useThemeColors();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, error, refetch } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markAsRead = useMarkAsRead();
  const deleteNotif = useDeleteNotification();
  const [refreshing, setRefreshing] = useState(false);

  const notifs = data?.data ?? [];
  const unreadCount = notifs.filter((n) => n.read_at === null).length;
  const sections = groupByDate(notifs);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  if (!accessToken) {
    return (
      <Screen bottomInset={false} header={<ScreenHeader title="Notifications" />}>
        <LoginGate
          redirect="/(tabs)/notifications"
          title="Vos alertes vous attendent"
          subtitle="Connectez-vous pour recevoir des notifications sur vos annonces et vos recherches."
        />
      </Screen>
    );
  }

  const unreadLabel = `${unreadCount} non ${unreadCount > 1 ? 'lues' : 'lue'}`;
  const header = (
    <ScreenHeader
      title="Notifications"
      actions={
        unreadCount > 0 ? (
          <Button
            label="Tout lire"
            icon="done-all"
            variant="text"
            accessibilityLabel={`Tout marquer comme lu, ${unreadLabel}`}
            loading={markAllRead.isPending}
            onPress={() => markAllRead.mutate()}
          />
        ) : null
      }
    />
  );

  let empty = null;
  if (isLoading) {
    empty = (
      <View accessible accessibilityLabel="Chargement des notifications…" accessibilityState={{ busy: true }}>
        {[1, 2, 3, 4, 5].map((k) => (
          <NotifSkeleton key={k} />
        ))}
      </View>
    );
  } else if (isError && isNetworkError(error)) {
    empty = <OfflineState onRetry={() => refetch()} />;
  } else if (isError) {
    empty = <ErrorState title="Impossible de charger vos notifications" onRetry={() => refetch()} />;
  } else {
    empty = (
      <EmptyState
        icon="notifications-none"
        title="Aucune notification"
        description="Vous n'avez rien reçu pour le moment. Vos alertes Domilix apparaîtront ici."
      />
    );
  }

  return (
    <Screen
      scroll={false}
      bottomInset={false}
      header={header}
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <SectionList
        sections={isLoading || isError ? [] : sections}
        keyExtractor={(item) => String(item.id)}
        renderSectionHeader={({ section }) => <NotifGroup title={section.title} />}
        renderItem={({ item }) => (
          <NotifItem
            notification={item}
            onPress={item.read_at === null ? () => markAsRead.mutate(item.id) : undefined}
            onDelete={(id) => deleteNotif.mutate(id)}
          />
        )}
        ListEmptyComponent={empty}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.primaryContainer]}
            progressBackgroundColor={C.surfaceContainerLowest}
            tintColor={C.primaryContainer}
          />
        }
      />
    </Screen>
  );
}
