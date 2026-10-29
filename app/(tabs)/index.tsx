import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import { BroadcastBanner } from '@/components/home/broadcast-banner';
import { SectionHeader } from '@/components/home/section-header';
import { AnnounceCard } from '@/components/listing/announce-card';
import { activeFilters } from '@/components/search/active-filters';
import {
  AppText,
  ChipGroup,
  EmptyState,
  ErrorState,
  IconButton,
  ListingCardSkeleton,
  Screen,
  SearchBar,
} from '@/components/ui';
import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useAnnounces, useCities, useToggleLike } from '@/hooks/queries/use-announces';
import { useBroadcasts } from '@/hooks/queries/use-broadcasts';
import { useUnreadCount } from '@/hooks/queries/use-notifications';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/stores/auth.store';
import { useFilterStore } from '@/stores/filter.store';
import type { AnnounceType } from '@/types/announce';

const CATEGORIES = [
  { value: 'realestate' as const, label: 'Immobilier', icon: 'home-work' as const },
  { value: 'furniture' as const, label: 'Mobilier', icon: 'chair' as const },
];

const CITIES_LIMIT = '6';
const LISTINGS_PER_CITY = 8;

/** Horizontal row that bleeds to the screen edges and starts on the page gutter. */
function CardRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -Spacing.marginMobile }}
      contentContainerStyle={{ gap: Spacing.ms, paddingHorizontal: Spacing.marginMobile, paddingBottom: Spacing.sm }}
    >
      {children}
    </ScrollView>
  );
}

function SkeletonRow() {
  return (
    <CardRow>
      {[1, 2].map((k) => (
        <ListingCardSkeleton key={k} style={{ width: Sizes.listingCardWidth }} />
      ))}
    </CardRow>
  );
}

// ─── Region row (one horizontal scroll of listings per city) ──────────────────

function RegionRow({ city, onLike }: { city: string; onLike: (id: string) => void }) {
  const router = useRouter();
  const { data, isLoading } = useAnnounces({ type: 'realestate', city, page: 1 });
  const items = data?.data.slice(0, LISTINGS_PER_CITY) ?? [];

  if (!isLoading && items.length === 0) return null;

  function handleSeeAll() {
    // Only the row's own criteria (this city, Immobilier): drop every other narrowing
    // filter left by an earlier filter sheet so the list matches the row that was tapped.
    useFilterStore.getState().setFilters({
      city,
      type: undefined,
      ad_type: undefined,
      budget_min: undefined,
      budget_max: undefined,
      bedroom_min: undefined,
      amenities: undefined,
      standing: undefined,
      search: undefined,
    });
    router.push('/(tabs)/explore');
  }

  return (
    <View style={{ gap: Spacing.xs }}>
      <SectionHeader title={city} onSeeAll={handleSeeAll} seeAllLabel={`Tout voir à ${city}`} />
      {isLoading ? (
        <SkeletonRow />
      ) : (
        <CardRow>
          {items.map((item) => (
            <AnnounceCard
              key={item.id}
              announce={item}
              onPress={() => router.push(`/announces/${item.id}`)}
              onToggleFavorite={onLike}
              style={{ width: Sizes.listingCardWidth }}
            />
          ))}
        </CardRow>
      )}
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function HomeHeader() {
  const C = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: unread } = useUnreadCount();
  const count = unread?.count ?? 0;
  const firstName = user?.name?.trim().split(/\s+/)[0];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.md,
        paddingHorizontal: Spacing.marginMobile,
        paddingTop: Spacing.sm,
      }}
    >
      <View style={{ flexShrink: 1 }}>
        {firstName ? (
          <AppText color="onSurfaceVariant" numberOfLines={1}>
            {`Bonjour ${firstName}`}
          </AppText>
        ) : null}
        <AppText variant="title" color="link" accessibilityRole="header" accessibilityLabel="Domilix">
          DOMILIX
        </AppText>
      </View>
      <View>
        <IconButton
          icon="notifications-none"
          label={count > 0 ? `Notifications, ${count} non lue${count > 1 ? 's' : ''}` : 'Notifications'}
          color="link"
          background="surfaceContainerLowest"
          onPress={() => router.push('/(tabs)/notifications')}
          style={{ borderWidth: Borders.thin, borderColor: C.outlineVariant }}
        />
        {count > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: Spacing.sm,
              right: Spacing.sm,
              width: Sizes.dot + Borders.focus * 2,
              height: Sizes.dot + Borders.focus * 2,
              borderRadius: Radii.full,
              backgroundColor: C.error,
              borderWidth: Borders.focus,
              borderColor: C.surfaceContainerLowest,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const filterCount = useFilterStore((s) => activeFilters(s.filters).length);

  const { data: broadcastsData, refetch: refetchBroadcasts } = useBroadcasts();
  const {
    data: cities,
    isLoading: citiesLoading,
    isError: citiesError,
    refetch: refetchCities,
  } = useCities({ type: 'realestate', order_by: 'count', order: 'desc', limit: CITIES_LIMIT });
  const toggleLike = useToggleLike();

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      refetchBroadcasts(),
      refetchCities(),
      qc.invalidateQueries({ queryKey: ['announces'] }),
    ]);
    setRefreshing(false);
  }

  const broadcast = broadcastsData?.[0];

  function handleSearch() {
    if (search.trim()) {
      router.push({ pathname: '/(tabs)/explore', params: { q: search.trim() } });
    }
  }

  function handleCategory(type: AnnounceType) {
    useFilterStore.getState().setFilter('type', type === 'realestate' ? undefined : type);
    router.push('/(tabs)/explore');
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

  let regions: ReactNode;
  if (citiesLoading) {
    regions = (
      <View accessible accessibilityLabel="Chargement des annonces…" accessibilityState={{ busy: true }}>
        <SkeletonRow />
      </View>
    );
  } else if (citiesError && !cities) {
    regions = <ErrorState title="Impossible de charger les annonces" onRetry={() => refetchCities()} />;
  } else if (!cities?.length) {
    regions = (
      <EmptyState
        icon="home-work"
        title="Aucune annonce pour le moment"
        description="Revenez bientôt ou lancez une recherche."
        actionLabel="Explorer"
        onAction={() => router.push('/(tabs)/explore')}
      />
    );
  } else {
    regions = cities.map((city) => <RegionRow key={city} city={city} onLike={(id) => toggleLike.mutate(id)} />);
  }

  return (
    <Screen
      header={<HomeHeader />}
      bottomInset={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
      contentStyle={{ gap: Spacing.lg }}
    >
      <View style={{ gap: Spacing.md }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          onFilterPress={() => router.push('/(modals)/filter-sheet')}
          filterCount={filterCount}
        />
        <ChipGroup
          label="Catégorie"
          layout="scroll"
          options={CATEGORIES}
          // The home screen lists real estate: Immobilier shows as the current one.
          value="realestate"
          onChange={handleCategory}
        />
      </View>

      {broadcast ? (
        <BroadcastBanner broadcast={broadcast} onPress={() => handleBroadcastPress(broadcast.action_url)} />
      ) : null}

      {regions}
    </Screen>
  );
}
