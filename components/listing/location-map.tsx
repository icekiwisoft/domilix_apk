import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { pressedStyle } from '@/components/ui/pressed';
import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { GeoapifyService } from '@/services/geoapify.service';

interface LocationMapProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  city?: string;
  address?: string;
  unlocked?: boolean;
}

const MAP_HEIGHT = 180;

function toCoordinate(value: number | string | null | undefined) {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) ? number : null;
}

// Listing location as a static map image (no native map SDK or Google key):
// the exact point when the backend sends coordinates, otherwise the area of the
// address or city (coordinates stay hidden until the listing is unlocked).
export function LocationMap({ latitude, longitude, city, address, unlocked }: LocationMapProps) {
  const C = useThemeColors();
  const [failed, setFailed] = useState(false);
  const lat = toCoordinate(latitude);
  const lng = toCoordinate(longitude);
  const exact = lat !== null && lng !== null;
  const areaQuery = [address, city, 'Cameroun'].filter(Boolean).join(', ');

  const { data: area } = useQuery({
    queryKey: ['geocode-area', areaQuery],
    enabled: !exact && Boolean(city),
    staleTime: Infinity,
    retry: false,
    queryFn: async ({ signal }) => {
      const [first] = await GeoapifyService.search(areaQuery, signal);
      if (first) return first.center;
      const [cityOnly] = await GeoapifyService.search(city ?? '', signal, 'city');
      return cityOnly?.center ?? null;
    },
  });

  const center = exact ? { longitude: lng, latitude: lat } : area ? { longitude: area[0], latitude: area[1] } : null;
  let mapUrl: string | null = null;
  try {
    mapUrl = center ? GeoapifyService.staticMapUrl({ ...center, zoom: exact ? 15 : 13, marker: exact }) : null;
  } catch {
    mapUrl = null; // No Geoapify key in this build: placeholder and Maps link only.
  }

  function openInMaps() {
    const label = [address, city].filter(Boolean).join(', ');
    const query = exact ? `${lat},${lng}` : label;
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodeURIComponent(label)}${exact ? `&ll=${lat},${lng}` : ''}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    });
    void Linking.openURL(url);
  }

  return (
    <View style={{ gap: Spacing.xs }}>
      <Pressable
        onPress={openInMaps}
        accessibilityRole="link"
        accessibilityLabel="Ouvrir l'emplacement dans Maps"
        style={({ pressed }) => [
          styles.map,
          { backgroundColor: C.surfaceContainerHigh, borderColor: C.outlineVariant },
          pressedStyle(pressed),
        ]}
      >
        {mapUrl && !failed ? (
          <Image
            source={{ uri: mapUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            onError={() => setFailed(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="map" size={Sizes.iconLg} color={C.onSurfaceVariant} />
          </View>
        )}
        <View style={[styles.chip, { backgroundColor: C.surfaceContainerLowest }]}>
          <MaterialIcons name="open-in-new" size={Sizes.iconSm} color={C.onSurface} />
          <AppText variant="label">Ouvrir dans Maps</AppText>
        </View>
      </Pressable>
      {!exact ? (
        <AppText variant="caption" color="onSurfaceVariant">
          {unlocked
            ? "Zone approximative : l'annonceur n'a pas indiqué de position précise."
            : "Zone approximative. Débloquez l'annonce pour obtenir l'adresse exacte."}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: MAP_HEIGHT,
    borderRadius: Radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chip: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    minHeight: Sizes.touchTarget - Spacing.sm * 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.ms,
    borderRadius: Radii.full,
  },
});
