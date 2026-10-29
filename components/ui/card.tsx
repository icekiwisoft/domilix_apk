import { Pressable, View, type GestureResponderEvent, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Borders, Opacity, Radii, Shadows, Spacing, type ColorToken } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/use-theme-color';

export interface CardProps extends Omit<ViewProps, 'style'> {
  /** Surface token; `surfaceContainerLowest` is the white card of the website. */
  surface?: ColorToken;
  /**
   * Outline instead of a shadow (cards on a coloured surface). Defaults to
   * true in the dark theme, where a shadow does not show the card's edge.
   */
  outlined?: boolean;
  /** Inner padding; `none` for cards that start with a full-bleed image. */
  padding?: 'none' | 'sm' | 'md';
  /** Makes the whole card a button (ripple, TalkBack role); give it an accessibilityLabel. */
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Rounded surface (website ProductCard: rounded-2xl, shadow-card). */
export function Card({
  surface = 'surfaceContainerLowest',
  outlined,
  padding = 'md',
  onPress,
  disabled,
  style,
  ...rest
}: CardProps) {
  const C = useThemeColors();
  const scheme = useColorScheme();
  const edge = outlined ?? scheme === 'dark';
  const base: ViewStyle[] = [
    {
      backgroundColor: C[surface],
      borderRadius: Radii.card,
      borderCurve: 'continuous',
      padding: padding === 'none' ? 0 : padding === 'sm' ? Spacing.sm : Spacing.md,
      gap: Spacing.sm,
    },
    edge ? { borderWidth: Borders.thin, borderColor: C.outlineVariant } : Shadows.card,
  ];
  if (!onPress) return <View style={[...base, style]} {...rest} />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: C.ripple }}
      style={({ pressed }) => [
        ...base,
        // The ripple stays inside the rounded corners.
        { overflow: 'hidden' },
        disabled ? { opacity: Opacity.disabled } : null,
        pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
        style,
      ]}
      {...rest}
    />
  );
}
