import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnnounceCard } from '@/components/listing/announce-card';
import { ListingMapPin } from '@/components/listing/listing-map-pin';
import { activeFilters } from '@/components/search/active-filters';
import { ExploreHeader } from '@/components/search/explore-header';
import { AppText, Button, Card, formatAmount } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAnnounces, useToggleLike } from '@/hooks/queries/use-announces';
import { useFilterStore } from '@/stores/filter.store';

const INITIAL_REGION = {
  latitude: 4.05,
  longitude: 9.71,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

export default function MapScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Same filters as the list, so switching Liste / Carte shows the same listings.
  const { filters, setFilters } = useFilterStore();
  const search = filters.search ?? '';
  const { data, isError, refetch } = useAnnounces({
    ...filters,
    type: filters.type ?? 'realestate',
    ad_type: filters.ad_type ?? 'location',
    search: search.trim() || undefined,
  });
  const toggleLike = useToggleLike();
  // The list API has no coordinates: listings are spread around their city
  // centre (existing behaviour, see the UI-07 report).
  const located = (data?.data ?? []).map((a, i) => ({
    ...a,
    lat: (a.city === 'Yaoundé' ? 3.848 : 4.05) + (i % 5) * 0.012 - 0.024,
    lng: (a.city === 'Yaoundé' ? 11.502 : 9.7) + (i % 4) * 0.015 - 0.03,
  }));
  const selected = located.find((a) => a.id === selectedId) ?? null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={(e) => {
          if (e.nativeEvent.action !== 'marker-press') setSelectedId(null);
        }}
      >
        {located.map((a) => (
          <Marker
            key={a.id}
            coordinate={{ latitude: a.lat, longitude: a.lng }}
            onPress={() => setSelectedId(a.id)}
            anchor={{ x: 0.5, y: 0.5 }}
            accessibilityLabel={`${a.city}, ${formatAmount(a.price)} FCFA${selected?.id === a.id ? ', sélectionnée' : ''}`}
          >
            <ListingMapPin price={a.price} selected={selected?.id === a.id} />
          </Marker>
        ))}
      </MapView>

      <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top, left: 0, right: 0 }}>
        <ExploreHeader
          mode="map"
          search={search}
          onSearchChange={(text) => setFilters({ search: text || undefined })}
          chips={activeFilters(filters)}
          onRemoveChip={(c) => setFilters(c.remove(filters))}
          onModeChange={() => router.back()}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: Spacing.marginMobile, right: Spacing.marginMobile, bottom: Spacing.md }}
      >
        {isError ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <AppText style={{ flex: 1 }} accessibilityLiveRegion="polite">
              Impossible de charger les annonces.
            </AppText>
            <Button label="Réessayer" variant="text" onPress={() => refetch()} />
          </Card>
        ) : selected ? (
          <AnnounceCard
            variant="compact"
            announce={selected}
            onPress={() => router.push(`/announces/${selected.id}`)}
            onToggleFavorite={(id) => toggleLike.mutate(id)}
          />
        ) : null}
      </View>
      {/* Map tiles are light in both themes. */}
      <StatusBar style="dark" />
    </View>
  );
}

