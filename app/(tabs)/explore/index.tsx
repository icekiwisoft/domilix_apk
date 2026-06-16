import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { SearchBar } from '@/components/search/search-bar';
import { FilterBar } from '@/components/search/filter-bar';
import { ResultsCount } from '@/components/search/results-count';
import { MapListToggle } from '@/components/search/map-list-toggle';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { ListingCard } from '@/components/listing/listing-card';
import { ListingSkeleton } from '@/components/listing/listing-skeleton';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnounces } from '@/hooks/queries/use-announces';
import { useFilterStore } from '@/stores/filter.store';
import type { AnnounceType, AdType } from '@/types/announce';

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

  const { data, isLoading, isFetching, refetch } = useAnnounces({
    ...filters,
    type: announceType,
    ad_type: adType,
    search: search.trim() || undefined,
    page,
  });

  const announces = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasMore = data ? data.page < data.last_page : false;

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
          <ToggleSwitch
            options={[
              { label: 'Immobilier', value: 'realestate' },
              { label: 'Mobilier', value: 'furniture' },
            ]}
            value={announceType}
            onChange={(v) => { setAnnounceType(v as AnnounceType); setPage(1); }}
          />
          {announceType === 'realestate' && (
            <ToggleSwitch
              options={[
                { label: 'Location', value: 'location' },
                { label: 'Vente', value: 'sale' },
              ]}
              value={adType}
              onChange={(v) => { setAdType(v as AdType); setPage(1); }}
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
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {isLoading ? (
              <ActivityIndicator color={C.primary} />
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
              <Pressable onPress={clearFilters} style={styles.clearBtn}>
                <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                  Réinitialiser les filtres
                </Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          hasMore && !isLoading ? (
            <Pressable
              onPress={() => setPage((p) => p + 1)}
              style={[styles.loadMore, { borderColor: C.outlineVariant }]}
            >
              <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                Charger plus
              </Text>
            </Pressable>
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

      {/* Map toggle FAB */}
      <View style={styles.fab} pointerEvents="box-none">
        <MapListToggle mode="list" onToggle={() => router.push('/(tabs)/explore/map')} />
      </View>
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
  listHeader: {
    paddingBottom: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },
  skeletons: {
    gap: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  clearBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  loadMore: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
