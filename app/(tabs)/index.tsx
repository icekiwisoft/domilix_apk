import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
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
import { Skeleton } from '@/components/ui/skeleton';
import { SearchBar } from '@/components/search/search-bar';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAnnounces, useToggleLike } from '@/hooks/queries/use-announces';
import { useBroadcasts } from '@/hooks/queries/use-broadcasts';
import { useUnreadCount } from '@/hooks/queries/use-notifications';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORIES = [
  { id: 'realestate', label: 'Immobilier', icon: 'home-work' as const, active: true },
  { id: 'furniture', label: 'Mobilier', icon: 'chair' as const, active: false },
];

export default function HomeScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: unreadCount } = useUnreadCount();
  const { data: broadcastsData, refetch: refetchBroadcasts } = useBroadcasts();
  const { data: recentData, isLoading: recentLoading, refetch: refetchRecent } = useAnnounces({ type: 'realestate', page: 1 });
  const { data: furnitureData, isLoading: furnitureLoading, refetch: refetchFurniture } = useAnnounces({ type: 'furniture', page: 1 });
  const toggleLike = useToggleLike();

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchBroadcasts(), refetchRecent(), refetchFurniture()]);
    setRefreshing(false);
  }

  const broadcast = broadcastsData?.[0];
  const featured = recentData?.data.slice(0, 4) ?? [];
  const furniture = furnitureData?.data.slice(0, 6) ?? [];
  const featuredItem = recentData?.data[0];

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

        {/* Annonces Vedettes */}
        <View style={styles.section}>
          <SectionHeader title="Annonces Vedettes" onSeeAll={() => router.push('/(tabs)/explore')} />
        </View>
        {recentLoading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((k) => <ListingSkeleton key={k} />)}
          </View>
        ) : (
          <View style={[styles.section, { paddingHorizontal: 0 }]}>
            <FlatList
              data={featured}
              keyExtractor={(a) => a.id}
              renderItem={({ item }) => (
                <View style={{ flex: 1, paddingHorizontal: Spacing.marginMobile / 3 }}>
                  <ListingCard
                    announce={item}
                    onPress={() => handleCardPress(item.id)}
                    onLike={(id) => toggleLike.mutate(id)}
                  />
                </View>
              )}
              numColumns={2}
              columnWrapperStyle={{ gap: Spacing.xs }}
              scrollEnabled={false}
              contentContainerStyle={{ gap: Spacing.sm }}
            />
          </View>
        )}

        {/* Nouveautés Mobilier */}
        <View style={[styles.section, { marginTop: Spacing.sm }]}>
          <SectionHeader
            title="Nouveautés Mobilier"
            onSeeAll={() => router.push({ pathname: '/(tabs)/explore', params: { type: 'furniture' } })}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.miniRow}
        >
          {furnitureLoading
            ? [1, 2, 3].map((k) => (
                <View key={k} style={[styles.miniCard, { backgroundColor: C.surfaceContainerLowest }]}>
                  <Skeleton width={140} height={96} radius={0} />
                  <View style={styles.miniBody}>
                    <Skeleton width={80} height={10} />
                    <Skeleton width={60} height={10} style={{ marginTop: 3 }} />
                  </View>
                </View>
              ))
            : furniture.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.miniCard,
                    { backgroundColor: C.surfaceContainerLowest },
                    pressed && { opacity: 0.88 },
                  ]}
                  onPress={() => handleCardPress(item.id)}
                >
                  <Image
                    source={{ uri: item.medias?.[0]?.thumbnail ?? item.medias?.[0]?.file ?? `https://picsum.photos/seed/${item.id}/200/150` }}
                    style={styles.miniImage}
                    resizeMode="cover"
                  />
                  <View style={styles.miniBody}>
                    <Text
                      style={[Typography.caption, { color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold' }]}
                      numberOfLines={1}
                    >
                      {item.description.split('.')[0]}
                    </Text>
                    <Text style={[Typography.caption, { color: C.primary }]}>
                      {item.price?.toLocaleString('fr-FR')} {item.devise ?? 'FCFA'}
                    </Text>
                  </View>
                </Pressable>
              ))
          }
        </ScrollView>

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
  // Grid skeleton
  grid: {
    paddingHorizontal: Spacing.marginMobile,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  // Mini furniture cards
  miniRow: {
    paddingLeft: Spacing.marginMobile,
    paddingRight: Spacing.marginMobile,
    gap: Spacing.md,
  },
  miniCard: {
    width: 140,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  miniImage: {
    width: 140,
    height: 96,
  },
  miniBody: {
    padding: Spacing.xs,
    alignItems: 'center',
    gap: 3,
  },
});
