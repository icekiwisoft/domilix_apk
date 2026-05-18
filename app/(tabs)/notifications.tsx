import { ActivityIndicator, Pressable, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NotifItem } from '@/components/notifications/notif-item';
import { NotifGroup } from '@/components/notifications/notif-group';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications, useMarkAllRead, useDeleteNotification } from '@/hooks/queries/use-notifications';
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

  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const deleteNotif = useDeleteNotification();

  const notifs = data?.data ?? [];
  const unreadCount = notifs.filter((n) => n.read_at === null).length;
  const sections = groupByDate(notifs);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant }]}>
        <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAllRead.mutate()} hitSlop={8} style={styles.markAll}>
            <MaterialIcons name="done-all" size={18} color={C.primary} />
            <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Tout lire
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : notifs.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="notifications-none" size={56} color={C.outlineVariant} />
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.lg, textAlign: 'center' }]}>
            Aucune notification pour l'instant.
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
              onDelete={(id) => deleteNotif.mutate(id)}
            />
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold' },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginMobile,
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
});
