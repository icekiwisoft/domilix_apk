import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StatTileProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  sub: string;
}

function StatTile({ icon, value, sub }: StatTileProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={[styles.tile, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant + '33' }]}>
      <MaterialIcons name={icon} size={28} color={C.primary} style={{ opacity: 0.9 }} />
      <Text style={[Typography.labelSm, { color: C.onSurface, marginTop: Spacing.xs }]}>{value}</Text>
      <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 2 }]}>{sub}</Text>
    </View>
  );
}

interface ListingStatsRowProps {
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
}

export function ListingStatsRow({ bedrooms, bathrooms, size }: ListingStatsRowProps) {
  const tiles = [
    bedrooms != null && { icon: 'bed' as const, value: `${bedrooms} Lits`, sub: 'Chambres' },
    bathrooms != null && { icon: 'bathtub' as const, value: `${bathrooms} Bains`, sub: 'Salles de bain' },
    size != null && { icon: 'square-foot' as const, value: `${size} m²`, sub: 'Surface habitable' },
  ].filter(Boolean) as { icon: keyof typeof MaterialIcons.glyphMap; value: string; sub: string }[];

  if (tiles.length === 0) return null;

  return (
    <View style={styles.row}>
      {tiles.map((t, i) => (
        <StatTile key={i} icon={t.icon} value={t.value} sub={t.sub} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.card,
    shadowOpacity: 0.02,
  },
});
