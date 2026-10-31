import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { ExploreHeader } from '@/components/search/explore-header';
import { AnnounceCard } from '@/components/listing/announce-card';
import { activeFilters, cityLabel } from '@/components/search/active-filters';
import { AppText, Button, EmptyState, ErrorState, ListingCardSkeleton, Screen, useToast } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useCreateAlert } from '@/hooks/queries/use-alerts';
import { useAnnounces, useToggleLike } from '@/hooks/queries/use-announces';
import { useThemeColors } from '@/hooks/use-theme-color';
import { announceFiltersToAlertFilters } from '@/lib/alert-helpers';
import { getApiErrorMessage } from '@/lib/api-error';
import { SearchHistoryService } from '@/services/search-history.service';
import { useAuthStore } from '@/stores/auth.store';
import { toAnnounceQuery, useFilterStore } from '@/stores/filter.store';

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
  const query = toAnnounceQuery(filters);

  // Back to page 1 whenever the search or a filter changes.
  const queryKey = JSON.stringify(query);
  const [pageState, setPageState] = useState({ key: queryKey, page: 1 });
  const page = pageState.key === queryKey ? pageState.page : 1;

  const { data, isLoading, isFetching, isError, refetch } = useAnnounces({ ...query, page });
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const createAlert = useCreateAlert();
  const lastLoggedKey = useRef<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const announces = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const hasMore = data ? data.meta.current_page < data.meta.last_page : false;
  const chips = activeFilters(filters);
  const announceType = query.type ?? 'realestate';

  // Record the search (type, text, filters, result count) once the user has
  // stopped typing and the results are in, so admins can see what people look
  // for. Skipped for pagination and never blocks the UI.
  useEffect(() => {
    if (!data || isFetching || page !== 1) return;
    if (queryKey === lastLoggedKey.current) return;
    const timer = setTimeout(() => {
      lastLoggedKey.current = queryKey;
      const { page: _page, ...logged } = query;
      void SearchHistoryService.log({
        type: announceType,
        search_text: query.search,
        filters: logged,
        results_count: total,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, isFetching, page, queryKey, query, announceType, total]);

  function handleCreateAlert() {
    if (!accessToken) {
      router.push({ pathname: '/(auth)/login', params: { redirect: '/(tabs)/explore' } });
      return;
    }
    if (announceType === 'land') return;
    const text = search.trim();
    createAlert.mutate(
      {
        requestType: announceType,
        description: text ? `Recherche à ${text}` : 'Alerte de recherche',
        filters: announceFiltersToAlertFilters(query, { search: text, ad_type: query.ad_type }),
      },
      {
        onSuccess: () =>
          toast.show("Votre alerte est active. Nous vous préviendrons dès qu'une annonce correspondra.", 'success'),
        onError: (err) => toast.show(getApiErrorMessage(err, "Impossible de créer l'alerte pour le moment."), 'error'),
      }
    );
  }

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
      <View style={{ gap: Spacing.md }}>
        <EmptyState
          icon="search-off"
          title="Aucune annonce ne correspond à vos critères"
          description={chips.length || search.trim() ? 'Retirez un filtre ou modifiez votre recherche.' : undefined}
          actionLabel={chips.length || search.trim() ? 'Réinitialiser les filtres' : undefined}
          onAction={resetAll}
        />
        {announceType !== 'land' ? (
          <View style={{ gap: Spacing.sm, paddingHorizontal: Spacing.md }}>
            <Button
              label="Créer une alerte"
              icon="add-alert"
              loading={createAlert.isPending}
              onPress={handleCreateAlert}
              style={{ alignSelf: 'center' }}
            />
            <AppText variant="caption" color="onSurfaceVariant" style={{ textAlign: 'center' }}>
              {"Vous serez averti par email et dans Domilix lorsqu'une nouvelle annonce correspondra à ces critères, tant que l'alerte restera active."}
            </AppText>
          </View>
        ) : null}
      </View>
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
              <ResultsCount count={total} query={search.trim() || undefined} city={cityLabel(filters)} />
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
