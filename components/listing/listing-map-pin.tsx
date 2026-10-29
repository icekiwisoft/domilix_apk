import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { Borders, Radii, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

interface ListingMapPinProps {
  price: number;
  selected?: boolean;
}

/** "250k", "90 M": the full price is on the preview card and in the TalkBack label. */
export function shortPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',')} Md`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}k`;
  return String(price);
}

/**
 * Price marker of the map (mock-up "Carte"): a pill with a ring, inverted
 * when selected so the selection shows by more than a hue. Contrast:
 * onSurface on surfaceContainerLowest 17:1, inverseOnSurface on inverseSurface 12:1.
 */
export function ListingMapPin({ price, selected = false }: ListingMapPinProps) {
  const C = useThemeColors();
  return (
    <View
      style={[
        {
          paddingHorizontal: Spacing.ms,
          paddingVertical: Spacing.xs,
          borderRadius: Radii.full,
          borderWidth: Borders.focus,
          borderColor: selected ? C.inverseOnSurface : C.surfaceContainerLowest,
          backgroundColor: selected ? C.inverseSurface : C.surfaceContainerLowest,
          // Room for the shadow inside the marker snapshot.
          margin: Spacing.xs,
        },
        Shadows.xs,
      ]}
    >
      <AppText variant="label" color={selected ? 'inverseOnSurface' : 'onSurface'}>
        {shortPrice(price)}
      </AppText>
    </View>
  );
}
