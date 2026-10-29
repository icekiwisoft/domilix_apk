import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Chip, SearchBar, SegmentedControl } from '@/components/ui';
import { Borders, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import type { ActiveFilter } from './active-filters';

type Mode = 'list' | 'map';

const MODES = [
  { value: 'list' as const, label: 'Liste', icon: 'view-list' as const },
  { value: 'map' as const, label: 'Carte', icon: 'map' as const },
];

interface ExploreHeaderProps {
  mode: Mode;
  search: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit?: () => void;
  onModeChange: (mode: Mode) => void;
  /** Active filters (removable chips, and the count on the filter button). */
  chips: ActiveFilter[];
  onRemoveChip: (chip: ActiveFilter) => void;
}

/**
 * Explorer controls shared by the list and the map: search with the filter
 * button, Liste / Carte switch, removable active-filter chips. On the map
 * they float over it (shadows, no band); on the list they sit on a band
 * with a bottom edge.
 */
export function ExploreHeader({
  mode,
  search,
  onSearchChange,
  onSearchSubmit,
  onModeChange,
  chips,
  onRemoveChip,
}: ExploreHeaderProps) {
  const C = useThemeColors();
  const router = useRouter();
  const overMap = mode === 'map';
  return (
    <View
      style={[
        { gap: Spacing.ms, paddingHorizontal: Spacing.marginMobile, paddingTop: Spacing.sm },
        overMap
          ? null
          : {
              paddingBottom: Spacing.ms,
              backgroundColor: C.background,
              borderBottomWidth: Borders.thin,
              borderBottomColor: C.outlineVariant,
            },
      ]}
    >
      <SearchBar
        value={search}
        onChangeText={onSearchChange}
        onSubmitEditing={onSearchSubmit}
        placeholder="Où souhaitez-vous habiter ?"
        onFilterPress={() => router.push('/(modals)/filter-sheet')}
        filterCount={chips.length}
        floating={overMap}
      />
      <SegmentedControl
        label="Affichage"
        options={MODES}
        value={mode}
        onChange={(m) => {
          if (m !== mode) onModeChange(m);
        }}
        style={overMap ? Shadows.md : undefined}
      />
      {chips.length > 0 && !overMap ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Filtres actifs"
          style={{ marginHorizontal: -Spacing.marginMobile }}
          contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.marginMobile }}
        >
          {chips.map((c) => (
            <Chip key={c.key} label={c.label} onRemove={() => onRemoveChip(c)} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
