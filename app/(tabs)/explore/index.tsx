import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { ExploreHeader } from '@/components/search/explore-header';
import { AnnounceCard } from '@/components/listing/announce-card';
import { activeFilters } from '@/components/search/active-filters';
import { AppText, Button, EmptyState, ErrorState, ListingCardSkeleton, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAnnounces, useToggleLike } from '@/hooks/queries/use-announces';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useFilterStore } from '@/stores/filter.store';

function ResultsCount({ count, query, city }: { count: number; query?: string; city?: string }) {
  const noun = `${count} ${query ? 'résultat' : 'annonce'}${count !== 1 ? 's' : ''}`;
  const rest = query ? ` pour « ${query} »` : city ? ` à ${city}` : '';
  return (
    <AppText color="onSurfaceVariant" accessibilityLiveRegion="polite">
      <AppText variant="bodyStrong">{noun}</AppText>
      {rest}
    </AppText>
  );
}

export default function ExploreScreen() {
  const C = useThemeColors();
  const router = useRouter();

  const { filters, setFilters, clearFilters } = useFilterStore();
  // The search text lives in the filter store so the list and the map share it.
  const search = filters.search ?? '';
  const setSearch = (text: string) => setFilters({ search: text || undefined });
  const toggleLike = useToggleLike();
  const query = {
    ...filters,
    type: filters.type ?? 'realestate',
    ad_type: filters.ad_type ?? 'location',
    search: search.trim() || undefined,
  };

  // Back to page 1 whenever the search or a filter changes.
  const queryKey = JSON.stringify(query);
  const [pageState, setPageState] = useState({ key: queryKey, page: 1 });
  const page = pageState.key === queryKey ? pageState.page : 1;

  const { data, isLoading, isError, refetch } = useAnnounces({ ...query, page });
  const [refreshing, setRefreshing] = useState(false);

  const announces = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const hasMore = data ? data.meta.current_page < data.meta.last_page : false;
  const chips = activeFilters(filters);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function resetAll() {
    clearFilters();
  }

  let empty = null;
  if (isLoading) {
    empty = (
      <View accessible accessibilityLabel="Chargement des annonces…" accessibilityState={{ busy: true }} style={{ gap: Spacing.ms }}>
        {[1, 2, 3, 4].map((k) => (
          <ListingCardSkeleton key={k} variant="compact" />
        ))}
      </View>
    );
  } else if (isError) {
    empty = <ErrorState title="Impossible de charger les annonces" onRetry={() => refetch()} />;
  } else {
    empty = (
      <EmptyState
        icon="search-off"
        title="Aucune annonce ne correspond à vos critères"
        description={chips.length || search.trim() ? 'Retirez un filtre ou modifiez votre recherche.' : undefined}
        actionLabel={chips.length || search.trim() ? 'Réinitialiser les filtres' : undefined}
        onAction={resetAll}
      />
    );
  }

  return (
    <Screen
      scroll={false}
      bottomInset={false}
      header={
        <ExploreHeader
          mode="list"
          search={search}
          onSearchChange={setSearch}
          chips={chips}
          onRemoveChip={(c) => setFilters(c.remove(filters))}
          onModeChange={() => router.push('/(tabs)/explore/map')}
        />
      }
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <FlatList
        data={isLoading || isError ? [] : announces}
        keyExtractor={(a) => String(a.id)}
        renderItem={({ item }) => (
          <AnnounceCard
            variant="compact"
            announce={item}
            onPress={() => router.push(`/announces/${item.id}`)}
            onToggleFavorite={(id) => toggleLike.mutate(id)}
          />
        )}
        ListHeaderComponent={
          !isLoading && !isError && announces.length > 0 ? (
            <View style={{ paddingBottom: Spacing.xs }}>
              <ResultsCount count={total} query={search.trim() || undefined} city={filters.city} />
            </View>
          ) : null
        }
        ListEmptyComponent={empty}
        ListFooterComponent={
          hasMore && !isLoading ? (
            <Button
              label="Charger plus"
              variant="secondary"
              onPress={() => setPageState({ key: queryKey, page: page + 1 })}
              style={{ marginTop: Spacing.md, alignSelf: 'center' }}
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.ms }} />}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.marginMobile,
          paddingTop: Spacing.ms,
          paddingBottom: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
