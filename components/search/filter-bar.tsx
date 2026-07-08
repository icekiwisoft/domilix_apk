import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AnnounceFilters } from '@/types/announce';

const FILTER_ICONS: Partial<Record<keyof AnnounceFilters, string>> = {
  city: 'map-marker',
};

const FILTER_LABELS: Partial<Record<keyof AnnounceFilters, (v: unknown) => string>> = {
  city: (v) => `${v}`,
  standing: (v) => ({
    standard: 'Standard',
    confort: 'Confort',
    haut_standing: 'Haut standing',
  }[v as string] ?? String(v)),
  bedroom_min: (v) => `${v}+ ch.`,
  budget_max: (v) => `≤ ${Number(v).toLocaleString('fr')} FCFA`,
  budget_min: (v) => `≥ ${Number(v).toLocaleString('fr')} FCFA`,
};

const EXCLUDED: (keyof AnnounceFilters)[] = ['page', 'orderBy', 'type', 'ad_type', 'AnnouncerId', 'liked'];

interface FilterBarProps {
  filters: AnnounceFilters;
  onRemove: (key: keyof AnnounceFilters) => void;
}

export function FilterBar({ filters, onRemove }: FilterBarProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const chips = Object.entries(filters)
    .filter(([key, val]) => {
      if (EXCLUDED.includes(key as keyof AnnounceFilters)) return false;
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    })
    .map(([key, val]) => {
      const labelFn = FILTER_LABELS[key as keyof AnnounceFilters];
      return { key: key as keyof AnnounceFilters, label: labelFn ? labelFn(val) : String(val) };
    });

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map(({ key, label }) => (
        <Chip
          key={key}
          mode="flat"
          icon={FILTER_ICONS[key]}
          onClose={() => onRemove(key)}
          closeIconAccessibilityLabel={`Retirer le filtre ${label}`}
          style={{ backgroundColor: C.primaryFixed }}
          textStyle={{ color: C.primary }}
        >
          {label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingRight: Spacing.marginMobile,
  },
});
