import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Badge, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BroadcastBanner } from '@/components/home/broadcast-banner';
import { SectionHeader } from '@/components/home/section-header';
import { ListingCard } from '@/components/listing/listing-card';
import { ListingSkeleton } from '@/components/listing/listing-skeleton';
import { SearchBar } from '@/components/search/search-bar';
import { Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAnnounces, useCities, useToggleLike } from '@/hooks/queries/use-announces';
import { useBroadcasts } from '@/hooks/queries/use-broadcasts';
import { useUnreadCount } from '@/hooks/queries/use-notifications';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFilterStore } from '@/stores/filter.store';

const CATEGORIES = [
  { id: 'realestate', label: 'Immobilier', icon: 'home-work' as const, active: true },
  { id: 'furniture', label: 'Mobilier', icon: 'chair' as const, active: false },
];

const CITIES_LIMIT = '6';
const LISTINGS_PER_CITY = 8;

// ─── Region row (one horizontal scroll of listings per city) ──────────────────

function RegionRow({
  city,
  onCardPress,
  onLike,
}: {
  city: string;
  onCardPress: (id: string) => void;
  onLike: (id: string) => void;
}) {
  const { data, isLoading } = useAnnounces({ type: 'realestate', city, page: 1 });
  const items = data?.data.slice(0, LISTINGS_PER_CITY) ?? [];

  if (!isLoading && items.length === 0) return null;

  function handleSeeAll() {
    useFilterStore.getState().setFilter('city', city);
    router.push({ pathname: '/(tabs)/explore', params: { type: 'realestate' } });
  }

  return (
    <>
      <View style={styles.section}>
        <SectionHeader title={city} onSeeAll={handleSeeAll} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.regionRow}
        style={styles.regionScroll}
      >
        {isLoading
          ? [1, 2, 3].map((k) => (
              <View key={k} style={styles.regionCard}>
                <ListingSkeleton />
              </View>
            ))
          : items.map((item) => (
              <View key={item.id} style={styles.regionCard}>
                <ListingCard
                  announce={item}
                  onPress={() => onCardPress(item.id)}
                  onLike={onLike}
                />
              </View>
            ))}
      </ScrollView>
    </>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: unreadCount } = useUnreadCount();
  const { data: broadcastsData, refetch: refetchBroadcasts } = useBroadcasts();
  const { data: cities, isLoading: citiesLoading, refetch: refetchCities } = useCities({
    type: 'realestate',
    order_by: 'count',
    order: 'desc',
    limit: CITIES_LIMIT,
  });
  const toggleLike = useToggleLike();

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchBroadcasts(), refetchCities()]);
    setRefreshing(false);
  }

  const broadcast = broadcastsData?.[0];

  function handleSearch() {
    if (search.trim()) {
      router.push({ pathname: '/(tabs)/explore', params: { q: search.trim() } });
    }
  }

  function handleCardPress(id: string) {
    router.push(`/announces/${id}`);
  }

  function handleBroadcastPress(url?: string) {
    if (!url) {
      router.push('/(tabs)/explore');
      return;
    }
    if (/^https?:\/\//.test(url)) {
      Linking.openURL(url);
    } else {
      router.push(url as never);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant + '55' }]}>
        <Text style={[styles.logo, { color: C.primary }]}>DOMILIX</Text>
        <View style={styles.cartBtn}>
          <IconButton
            icon="bell-outline"
            size={24}
            iconColor={C.primary}
            accessibilityLabel="Notifications"
            onPress={() => router.push('/(tabs)/notifications')}
          />
          <Badge visible={!!unreadCount?.count} size={10} style={[styles.notifDot, { backgroundColor: C.error }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
        }
      >
        {/* Search */}
        <View style={styles.section}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={() => router.push('/(modals)/filter-sheet')}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Broadcast */}
        {broadcast && (
          <View style={styles.section}>
            <BroadcastBanner broadcast={broadcast} onPress={() => handleBroadcastPress(broadcast.action_url)} />
          </View>
        )}

        {/* Categories */}
        <View style={[styles.section, { paddingHorizontal: 0, paddingLeft: Spacing.marginMobile }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                accessibilityRole="button"
                accessibilityLabel={cat.label}
                accessibilityState={{ selected: cat.active }}
                style={({ pressed }) => [styles.catItem, pressed && { opacity: 0.75 }]}
                onPress={() => router.push({ pathname: '/(tabs)/explore', params: { type: cat.id } })}
              >
                <View style={[
                  styles.catCircle,
                  { backgroundColor: cat.active ? C.primaryContainer : C.secondaryContainer },
                ]}>
                  <MaterialIcons
                    name={cat.icon}
                    size={26}
                    color={cat.active ? C.onPrimaryContainer : C.onSecondaryContainer}
                  />
                </View>
                <Text style={[Typography.caption, { color: cat.active ? C.onSurface : C.onSurfaceVariant, marginTop: 4 }]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Régions — un scroll horizontal de logements par ville */}
        {citiesLoading ? (
          <>
            <View style={styles.section}>
              <SectionHeader title="Chargement…" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionRow}
              style={styles.regionScroll}
            >
              {[1, 2, 3].map((k) => (
                <View key={k} style={styles.regionCard}>
                  <ListingSkeleton />
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          (cities ?? []).map((city) => (
            <RegionRow
              key={city}
              city={city}
              onCardPress={handleCardPress}
              onLike={(id) => toggleLike.mutate(id)}
            />
          ))
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
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
  logo: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  cartBtn: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  scroll: { paddingTop: Spacing.md },
  section: {
    paddingHorizontal: Spacing.marginMobile,
    marginBottom: Spacing.md,
  },
  // Categories
  catRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.marginMobile,
  },
  catItem: {
    alignItems: 'center',
    minWidth: 72,
  },
  catCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xs,
  },
  // Regions (horizontal scroll of listings per city)
  regionScroll: {
    marginBottom: Spacing.lg,
  },
  regionRow: {
    paddingHorizontal: Spacing.marginMobile,
    gap: Spacing.sm,
  },
  regionCard: {
    width: 180,
  },
});
