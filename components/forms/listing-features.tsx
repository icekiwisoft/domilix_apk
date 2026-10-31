import { View } from 'react-native';

import { AppText, Chip, ChipGroup } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { Standing } from '@/types/announce';

import { AMENITY_OPTIONS, STANDING_OPTIONS, type AmenityKey, type AmenityOption } from './listing-options';

function Heading({ children }: { children: string }) {
  return (
    <AppText variant="bodyStrong" accessibilityRole="header">
      {children}
    </AppText>
  );
}

/** "Standing": one choice (radio chips); nothing selected until the user picks one. */
export function StandingPicker({ value, onChange }: { value: Standing | undefined; onChange: (s: Standing) => void }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <Heading>Standing</Heading>
      <ChipGroup label="Standing" options={STANDING_OPTIONS} value={value ?? null} onChange={onChange} />
    </View>
  );
}

/** "Équipements": each amenity is a checkbox chip with its icon. */
export function AmenityPicker({
  value,
  onToggle,
  options = AMENITY_OPTIONS,
}: {
  value: Record<AmenityKey, boolean>;
  onToggle: (key: AmenityKey) => void;
  options?: readonly AmenityOption[];
}) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <Heading>Équipements</Heading>
      <View accessibilityLabel="Équipements" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {options.map((a) => (
          <Chip
            key={a.key}
            label={a.label}
            accessibilityLabel={a.spoken}
            icon={a.icon}
            selected={value[a.key]}
            onPress={() => onToggle(a.key)}
          />
        ))}
      </View>
    </View>
  );
}
