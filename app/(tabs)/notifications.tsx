import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NotifItem } from '@/components/notifications/notif-item';
import { NotifGroup } from '@/components/notifications/notif-group';
import { NotifSkeleton } from '@/components/notifications/notif-skeleton';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications, useMarkAllRead, useMarkAsRead, useDeleteNotification } from '@/hooks/queries/use-notifications';
import { useAuthStore } from '@/stores/auth.store';
import { LoginGate } from '@/components/ui/login-gate';
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
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isFetching, refetch } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markAsRead = useMarkAsRead();
  const deleteNotif = useDeleteNotification();

  const notifs = data?.data ?? [];
  const unreadCount = notifs.filter((n) => n.read_at === null).length;
  const sections = groupByDate(notifs);

  if (!accessToken) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <View style={[styles.header, { borderBottomColor: C.outlineVariant }]}>
          <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>Notifications</Text>
        </View>
        <LoginGate
          title="Vos alertes vous attendent"
          subtitle="Connectez-vous pour recevoir des notifications sur vos annonces et vos recherches."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant + '66' }]}>
        <View>
          <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadPill, { backgroundColor: C.primary + '18' }]}>
              <Text style={[Typography.caption, { color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }]}>
                {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
              </Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllRead.mutate()}
            hitSlop={8}
            style={({ pressed }) => [styles.markAll, { backgroundColor: C.primaryFixed }, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="done-all" size={16} color={C.primary} />
            <Text style={[Typography.caption, { color: C.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
              Tout marquer lu
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={{ paddingTop: Spacing.sm }}>
          {[1, 2, 3, 4, 5].map((k) => <NotifSkeleton key={k} />)}
        </View>
      ) : notifs.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: C.primaryFixed }]}>
            <MaterialIcons name="notifications-none" size={40} color={C.primary} />
          </View>
          <Text style={[Typography.headlineMd, { color: C.onSurface, textAlign: 'center', fontSize: 20 }]}>
            Tout est calme ici
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', lineHeight: 22 }]}>
            Vos notifications apparaîtront ici dès qu'il y aura de l'activité.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => <NotifGroup title={section.title} />}
          renderItem={({ item }) => (
            <NotifItem
              notification={item}
              onPress={item.read_at === null ? () => markAsRead.mutate(item.id) : undefined}
              onDelete={(id) => deleteNotif.mutate(id)}
            />
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
        />
      )}
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold' },
  unreadPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginMobile,
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
});
