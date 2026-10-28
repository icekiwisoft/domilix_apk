import { ListingCard } from '@/components/listing/listing-card';
import { ListingSkeleton } from '@/components/listing/listing-skeleton';
import { FilterBar } from '@/components/search/filter-bar';
import { ResultsCount } from '@/components/search/results-count';
import { SearchBar } from '@/components/search/search-bar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useToast } from '@/components/ui/toast';
import { useCreateAlert } from '@/hooks/queries/use-alerts';
import { useAnnounces, useToggleLike } from '@/hooks/queries/use-announces';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { announceFiltersToAlertFilters } from '@/lib/alert-helpers';
import { getApiErrorMessage } from '@/lib/api-error';
import { SearchHistoryService } from '@/services/search-history.service';
import { useAuthStore } from '@/stores/auth.store';
import { useFilterStore } from '@/stores/filter.store';
import type { AdType, AnnounceType } from '@/types/announce';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityIndicator, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const params = useLocalSearchParams<{ q?: string; type?: string }>();

  const [search, setSearch] = useState(params.q ?? '');
  const [announceType, setAnnounceType] = useState<AnnounceType>(
    (params.type as AnnounceType) ?? 'realestate'
  );
  const [adType, setAdType] = useState<AdType>('location');
  const [page, setPage] = useState(1);

  const { filters, setFilter, clearFilters } = useFilterStore();
  const toggleLike = useToggleLike();
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const createAlert = useCreateAlert();
  const lastLoggedKey = useRef<string | null>(null);

  // Land-only filters must not leak into real-estate / furniture searches.
  const { size_min, size_max, land_use, land_title, ...commonFilters } = filters;
  const queryFilters =
    announceType === 'land' ? { ...commonFilters, size_min, size_max, land_use, land_title } : commonFilters;

  const { data, isLoading, isFetching, refetch } = useAnnounces({
    ...queryFilters,
    type: announceType,
    ad_type: adType,
    search: search.trim() || undefined,
    page,
  });

  const announces = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const hasMore = data ? data.meta.current_page < data.meta.last_page : false;

  // Record the search (type, text, filters, result count) once the user has
  // stopped typing and the results are in, so admins can see what people look
  // for. Skipped for pagination and never blocks the UI.
  useEffect(() => {
    if (!data || isFetching || page !== 1) return;
    const key = JSON.stringify([announceType, adType, search.trim(), filters]);
    if (key === lastLoggedKey.current) return;
    const timer = setTimeout(() => {
      lastLoggedKey.current = key;
      void SearchHistoryService.log({
        type: announceType,
        search_text: search.trim() || undefined,
        filters: { ...filters, search: search.trim() || undefined, ad_type: adType },
        results_count: total,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, isFetching, page, announceType, adType, search, filters, total]);

  function handleCreateAlert() {
    if (!accessToken) {
      router.push('/(auth)/login');
      return;
    }
    if (announceType === 'land') return;
    createAlert.mutate(
      {
        requestType: announceType,
        description: search.trim() ? `Recherche à ${search.trim()}` : 'Alerte de recherche',
        filters: announceFiltersToAlertFilters(filters, { search, ad_type: adType }),
      },
      {
        onSuccess: () =>
          toast.show('Votre alerte est active. Nous vous préviendrons dès qu\'une annonce correspondra.', 'success'),
        onError: (err) => toast.show(getApiErrorMessage(err, "Impossible de créer l'alerte pour le moment."), 'error'),
      }
    );
  }

  function handleFilterPress() {
    router.push('/(modals)/filter-sheet');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header controls */}
      <View style={[styles.controls, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant }]}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onFilterPress={handleFilterPress}
          placeholder="Où souhaitez-vous habiter ?"
        />

        <View style={styles.toggleRow}>
          <SegmentedButtons
            style={styles.segmented}
            value={announceType}
            onValueChange={(v) => { setAnnounceType(v as AnnounceType); setPage(1); }}
            theme={{ colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } }}
            buttons={[
              { value: 'realestate', label: 'Immobilier' },
              { value: 'furniture', label: 'Mobilier' },
              { value: 'land', label: 'Terrain' },
            ]}
          />
          {announceType !== 'furniture' && (
            <SegmentedButtons
              style={styles.segmented}
              value={adType}
              onValueChange={(v) => { setAdType(v as AdType); setPage(1); }}
              theme={{ colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } }}
              buttons={[
                { value: 'location', label: 'Location' },
                { value: 'sale', label: 'Vente' },
              ]}
            />
          )}
        </View>

        <FilterBar
          filters={filters}
          onRemove={(key) => setFilter(key, undefined)}
        />
      </View>

      <FlatList
        data={isLoading ? [] : announces}
        keyExtractor={(a) => a.id}
        numColumns={1}
        renderItem={({ item }) => (
          <ListingCard
            announce={item}
            onPress={() => router.push(`/announces/${item.id}`)}
            onLike={(id) => toggleLike.mutate(id)}
            imageHeight={200}
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <ResultsCount count={total} query={search.trim() || undefined} />
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletons}>
              {[1, 2, 3].map((k) => <ListingSkeleton key={k} />)}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center' }]}>
                Aucune annonce ne correspond à vos critères.
              </Text>
              <Button mode="text" onPress={clearFilters}>
                Réinitialiser les filtres
              </Button>
              {announceType !== 'land' && (
                <View style={styles.alertBox}>
                  <Button
                    mode="contained"
                    icon="bell-plus-outline"
                    onPress={handleCreateAlert}
                    loading={createAlert.isPending}
                    disabled={createAlert.isPending}
                  >
                    Créer une alerte
                  </Button>
                  <Text style={[Typography.caption, { color: C.onSurfaceVariant, textAlign: 'center', lineHeight: 18 }]}>
                    Vous serez averti par email et dans Domilix lorsqu&apos;une nouvelle annonce correspondra à ces critères,
                    tant que l&apos;alerte restera active.
                  </Text>
                </View>
              )}
            </View>
          )
        }
        ListFooterComponent={
          hasMore && !isLoading ? (
            <Button
              mode="outlined"
              onPress={() => setPage((p) => p + 1)}
              style={styles.loadMore}
            >
              Charger plus
            </Button>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  controls: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  segmented: {
    alignSelf: 'flex-start',
  },
  listHeader: {
    paddingBottom: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  skeletons: {
    gap: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  loadMore: {
    marginTop: Spacing.lg,
  },
  alertBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
