import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AnnouncerStatsProps {
  announcesCount: number;
  rating?: number;
  memberSince?: string;
}

export function AnnouncerStats({ announcesCount, rating, memberSince }: AnnouncerStatsProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const sinceYear = memberSince
    ? new Date(memberSince).getFullYear().toString()
    : null;

  const stats = [
    { value: String(announcesCount), label: 'Annonces', icon: null as null },
    rating != null && {
      value: rating.toFixed(1),
      label: 'Évaluation',
      icon: 'star' as const,
    },
    sinceYear != null && {
      value: sinceYear,
      label: 'Membre depuis',
      icon: null as null,
    },
  ].filter(Boolean) as { value: string; label: string; icon: keyof typeof MaterialIcons.glyphMap | null }[];

  return (
    <View style={styles.row}>
      {stats.map((s, i) => (
        <View key={i} style={styles.itemWrapper}>
          {i > 0 && <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />}
          <View style={styles.item}>
            <View style={styles.valueRow}>
              <Text style={[Typography.headlineMd, styles.value, { color: C.primary, fontSize: 24 }]}>
                {s.value}
              </Text>
              {s.icon && <MaterialIcons name={s.icon} size={18} color={C.primary} />}
            </View>
            <Text style={[Typography.labelSm, { color: C.onSurfaceVariant }]}>{s.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 48,
    marginHorizontal: Spacing.xl,
  },
  item: {
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  value: {
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
