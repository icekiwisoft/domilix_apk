import { View, type ViewProps } from 'react-native';

import { Borders, Radii, Shadows, Spacing, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

export interface CardProps extends ViewProps {
  /** Surface token; `surfaceContainerLowest` is the white card of the website. */
  surface?: ColorToken;
  /** Outline instead of a shadow (cards on a coloured surface, dark theme). */
  outlined?: boolean;
  /** Inner padding; `none` for cards that start with a full-bleed image. */
  padding?: 'none' | 'sm' | 'md';
}

/** Rounded surface (website ProductCard: rounded-2xl, shadow-card). */
export function Card({ surface = 'surfaceContainerLowest', outlined = false, padding = 'md', style, ...rest }: CardProps) {
  const C = useThemeColors();
  return (
    <View
      style={[
        {
          backgroundColor: C[surface],
          borderRadius: Radii.card,
          borderCurve: 'continuous',
          padding: padding === 'none' ? 0 : padding === 'sm' ? Spacing.sm : Spacing.md,
          gap: Spacing.sm,
        },
        outlined ? { borderWidth: Borders.thin, borderColor: C.outlineVariant } : Shadows.card,
        style,
      ]}
      {...rest}
    />
  );
}
