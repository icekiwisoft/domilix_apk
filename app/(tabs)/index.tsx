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
  Chip,
  ChipGroup,
  EmptyState,
  ErrorState,
  IconButton,
  ListingCardSkeleton,
  Screen,
  SearchBar,
} from '@/components/ui';
import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useAnnouncesList, useCities, useToggleLike } from '@/hooks/queries/use-announces';
import { useBroadcasts } from '@/hooks/queries/use-broadcasts';
import { useUnreadCount } from '@/hooks/queries/use-notifications';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/stores/auth.store';
import type { CityCount } from '@/services/announces.service';
import { toAnnounceQuery, useFilterStore, type ExploreFilters } from '@/stores/filter.store';
import type { Announce, AnnounceType, PaginatedResponse } from '@/types/announce';

const CATEGORIES = [
  { value: 'realestate' as const, label: 'Immobilier', icon: 'home-work' as const },
  { value: 'furniture' as const, label: 'Mobilier', icon: 'chair' as const },
];

/** Cards shown per row. */
const ROW_SIZE = 10;
/** A row is hidden below this many listings once the duplicates are removed. */
const ROW_MIN = 3;
/** City chips: cities with at least this many listings. */
const CITY_MIN_LISTINGS = 5;
/** GET /cities caps `limit` at 50. */
const CITIES_LIMIT = '50';

interface HomeRow {
  key: string;
  title: string;
  /** Exactly what "Tout voir" puts in the explore filters; the row's query derives from it. */
  filters: ExploreFilters;
}

// Same rows, in the same order, as the website (domilix.com src/views/Ads/Ads.tsx), real estate only.
const ROWS: HomeRow[] = [
  { key: 'recommended', title: 'Nos recommandations', filters: { ad_type: 'all', recommended: 1 } },
  { key: 'recent', title: 'Dernières annonces', filters: { ad_type: 'all' } },
  { key: 'night', title: 'Séjours à la nuit', filters: { period: 'night' } },
  { key: 'sale', title: 'Biens à vendre', filters: { ad_type: 'sale' } },
];

type RowState =
  | { row: HomeRow; status: 'loading' }
  | { row: HomeRow; status: 'ready'; items: Announce[] };

/**
 * Removes from each row the listings already shown in a row above it, then
 * keeps ROW_SIZE of them. A row waits for the rows above it, since its content
 * depends on theirs. Row i asks for ROW_SIZE × (i + 1) listings, so it still
 * has ROW_SIZE left when every listing shown above is in its page.
 */
function dedupeRows(pages: (PaginatedResponse<Announce> | undefined)[]): RowState[] {
  const shown = new Set<string>();
  let waiting = false;
  return ROWS.map((row, i) => {
    const page = pages[i];
    if (waiting || !page) {
      waiting = true;
      return { row, status: 'loading' };
    }
    const items = page.data.filter((a) => !shown.has(String(a.id))).slice(0, ROW_SIZE);
    for (const a of items) shown.add(String(a.id));
    return { row, status: 'ready', items };
  });
}

/** Strips flags and stray symbols typed into city names ("🇨🇲 yaounde" → "yaounde"). */
function cleanCity(name: string) {
  return name.replace(/[^\p{L}\p{N}\s'-]/gu, '').trim().replace(/\s+/g, ' ');
}

interface CityChip {
  /** Explore filter: the API's `city_normalized`, cleaned. */
  value: string;
  label: string;
  count: number;
}

/** Cities with at least CITY_MIN_LISTINGS listings, most listings first, one chip per normalised name. */
function cityChips(rows: CityCount[]): CityChip[] {
  const byCity = new Map<string, CityChip>();
  // GET /cities groups by city and country: "yaounde" comes back once with an
  // empty country and once with "cameroun". Rows arrive largest first, so the
  // label comes from the biggest group.
  for (const r of rows) {
    const value = cleanCity(r.city_normalized);
    if (!value) continue;
    const chip = byCity.get(value);
    if (chip) chip.count += r.ads_count;
    else byCity.set(value, { value, label: cleanCity(r.city) || value, count: r.ads_count });
  }
  return [...byCity.values()].filter((c) => c.count >= CITY_MIN_LISTINGS).sort((a, b) => b.count - a.count);
}

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

// ─── Listing row ──────────────────────────────────────────────────────────────

function ListingRow({ state, onLike }: { state: RowState; onLike: (id: string) => void }) {
  const router = useRouter();
  const { row } = state;

  if (state.status === 'loading') {
    return (
      <View
        accessible
        accessibilityLabel={`${row.title}, chargement…`}
        accessibilityState={{ busy: true }}
        style={{ gap: Spacing.xs }}
      >
        <SectionHeader title={row.title} />
        <SkeletonRow />
      </View>
    );
  }

  if (state.items.length < ROW_MIN) return null;

  function handleSeeAll() {
    // Only this row's criteria: nothing left over from an earlier search or filter sheet.
    useFilterStore.getState().replaceFilters(row.filters);
    router.push('/(tabs)/explore');
  }

  return (
    <View style={{ gap: Spacing.xs }}>
      <SectionHeader title={row.title} onSeeAll={handleSeeAll} seeAllLabel={`Tout voir : ${row.title}`} />
      <CardRow>
        {state.items.map((item) => (
          <AnnounceCard
            key={item.id}
            announce={item}
            onPress={() => router.push(`/announces/${item.id}`)}
            onToggleFavorite={onLike}
            style={{ width: Sizes.listingCardWidth }}
          />
        ))}
      </CardRow>
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
  const { data: cities, refetch: refetchCities } = useCities({
    type: 'realestate',
    order_by: 'count',
    order: 'desc',
    limit: CITIES_LIMIT,
  });
  // One cached query per row, under the same ['announces', …] key as the explore list so
  // favourites toggled anywhere update the cards here too.
  const rowQueries = useAnnouncesList(
    ROWS.map((row, i) => ({ ...toAnnounceQuery(row.filters), page: 1, per_page: ROW_SIZE * (i + 1) })),
  );
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
  const chips = cityChips(cities ?? []);

  function handleSearch() {
    if (search.trim()) {
      // The explore tab stays mounted: the store replaces its search even for an identical text.
      useFilterStore.getState().setFilters({ search: search.trim() });
      router.push('/(tabs)/explore');
    }
  }

  function handleCategory(type: AnnounceType) {
    useFilterStore.getState().setFilter('type', type === 'realestate' ? undefined : type);
    router.push('/(tabs)/explore');
  }

  function handleCity(city: string) {
    useFilterStore.getState().replaceFilters({ city });
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

  // A row that failed with nothing in cache: one error for the whole list, rows above
  // it included, since the duplicates can no longer be removed.
  const failed = rowQueries.filter((q) => q.isError && !q.data);
  const rowStates = dedupeRows(rowQueries.map((q) => q.data));
  let rows: ReactNode;
  if (failed.length > 0) {
    rows = (
      <ErrorState
        title="Impossible de charger les annonces"
        onRetry={() => {
          for (const q of failed) q.refetch();
        }}
      />
    );
  } else if (rowStates.every((r) => r.status === 'ready' && r.items.length < ROW_MIN)) {
    rows = (
      <EmptyState
        icon="home-work"
        title="Aucune annonce pour le moment"
        description="Revenez bientôt ou lancez une recherche."
        actionLabel="Explorer"
        onAction={() => router.push('/(tabs)/explore')}
      />
    );
  } else {
    rows = rowStates.map((state) => (
      <ListingRow key={state.row.key} state={state} onLike={(id) => toggleLike.mutate(id)} />
    ));
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
        {chips.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            accessibilityLabel="Villes"
            style={{ marginHorizontal: -Spacing.marginMobile }}
            contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.marginMobile }}
          >
            {chips.map((c) => (
              <Chip
                key={c.value}
                label={c.label}
                icon="location-on"
                // An action that opens the explore list, not a selectable chip.
                accessibilityRole="button"
                accessibilityState={{}}
                accessibilityLabel={`Annonces à ${c.label}`}
                onPress={() => handleCity(c.value)}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {broadcast ? (
        <BroadcastBanner broadcast={broadcast} onPress={() => handleBroadcastPress(broadcast.action_url)} />
      ) : null}

      {rows}
    </Screen>
  );
}
