import { StyleSheet, Text, useWindowDimensions, type TextProps, type TextStyle } from 'react-native';

import { TextVariants, type ColorToken, type TextVariant } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

export interface AppTextProps extends TextProps {
  /** Named style from TextVariants (title, headline, body, bodyStrong, label, caption, price). */
  variant?: TextVariant;
  /** Colour token, resolved for the active theme. */
  color?: ColorToken;
}

/**
 * React Native 0.81 (Fabric) caches text measurements under a key made of
 * the string and its layout attributes (TextMeasureCache.h:
 * fontSize, letterSpacing, lineHeight…), which hold nothing of the system
 * font scale. After a font size change with a screen open, a text kept the
 * size measured at the old scale and was clipped (QA-02, UI-08: name,
 * badge and title of the announcer profile; a remount does not help, the
 * key is the same). A letter spacing offset that moves with the scale makes
 * the key differ: 0.04 dp per unit of scale, above the cache's 0.005
 * equality epsilon from a 15 % step, far below anything visible.
 */
const SCALE_KEY = 0.04;

/**
 * Text of the shared components and of new screens. The size follows the
 * system font scale; pass `maxFontSizeMultiplier` only where a cap is
 * unavoidable (never below 2, the 200 % criterion).
 */
export function AppText({ variant = 'body', color = 'onSurface', style, ...rest }: AppTextProps) {
  const C = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const base = StyleSheet.flatten<TextStyle>([TextVariants[variant], style])?.letterSpacing ?? 0;
  const letterSpacing = base + fontScale * SCALE_KEY;
  return <Text {...rest} style={[TextVariants[variant], { color: C[color] }, style, { letterSpacing }]} />;
}
