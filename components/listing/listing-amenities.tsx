import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Announce } from '@/types/announce';

interface AmenityItem {
  key: keyof Pick<Announce, 'wifi' | 'pool' | 'air_conditioning' | 'security_24h' | 'gate' | 'smart_tv' | 'equipped_kitchen'>;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

const AMENITY_LIST: AmenityItem[] = [
  { key: 'wifi', icon: 'wifi', label: 'Wifi Haut Débit' },
  { key: 'pool', icon: 'pool', label: 'Piscine Privée' },
  { key: 'air_conditioning', icon: 'ac-unit', label: 'Climatisation' },
  { key: 'security_24h', icon: 'security', label: 'Gardiennage 24/7' },
  { key: 'gate', icon: 'lock', label: 'Portail Sécurisé' },
  { key: 'smart_tv', icon: 'tv', label: 'Smart TV' },
  { key: 'equipped_kitchen', icon: 'kitchen', label: 'Cuisine équipée' },
];

interface ListingAmenitiesProps {
  announce: Announce;
}

export function ListingAmenities({ announce }: ListingAmenitiesProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const active = AMENITY_LIST.filter((a) => announce[a.key]);

  if (active.length === 0) return null;

  return (
    <View style={styles.grid}>
      {active.map((a) => (
        <View key={a.key} style={styles.item}>
          <MaterialIcons name={a.icon} size={22} color={C.primary} style={{ opacity: 0.8 }} />
          <Text style={[Typography.bodyMd, { color: C.onSurface }]}>{a.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    rowGap: Spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '46%',
  },
});
