import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { SearchBar } from '@/components/search/search-bar';
import { MapListToggle } from '@/components/search/map-list-toggle';
import { ListingCardH } from '@/components/listing/listing-card-h';
import { ListingMapPin } from '@/components/listing/listing-map-pin';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnounces, useToggleLike } from '@/hooks/queries/use-announces';

const INITIAL_REGION = {
  latitude: 4.05,
  longitude: 9.71,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

export default function MapScreenContent() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data } = useAnnounces({ type: 'realestate', search: search.trim() || undefined });
  const toggleLike = useToggleLike();
  const located = (data?.data ?? []).map((a, i) => ({
    ...a,
    lat: (a.city === 'Yaoundé' ? 3.848 : 4.050) + (i % 5) * 0.012 - 0.024,
    lng: (a.city === 'Yaoundé' ? 11.502 : 9.700) + (i % 4) * 0.015 - 0.03,
  }));
  const selected = located.find((a) => a.id === selectedId) ?? null;

  return (
    <>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {located.map((a) => (
          <Marker
            key={a.id}
            coordinate={{ latitude: a.lat, longitude: a.lng }}
            onPress={() => setSelectedId(a.id)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <ListingMapPin
              price={a.price}
              devise={a.devise}
              selected={selected?.id === a.id}
            />
          </Marker>
        ))}
      </MapView>

      <View style={[styles.searchOverlay, { backgroundColor: C.surface }]}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Filtrer sur la carte…"
        />
      </View>

      {selected && (
        <View style={[styles.preview, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
          <ListingCardH
            announce={selected}
            onPress={() => router.push(`/announces/${selected.id}`)}
            onLike={(id) => toggleLike.mutate(id)}
          />
        </View>
      )}

      <View style={styles.fab} pointerEvents="box-none">
        <MapListToggle mode="map" onToggle={() => router.back()} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.marginMobile,
    right: Spacing.marginMobile,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  preview: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.marginMobile,
    right: Spacing.marginMobile,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
