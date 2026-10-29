import { Text, type TextProps } from 'react-native';

import { TextVariants, type ColorToken, type TextVariant } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

export interface AppTextProps extends TextProps {
  /** Named style from TextVariants (title, headline, body, bodyStrong, label, caption, price). */
  variant?: TextVariant;
  /** Colour token, resolved for the active theme. */
  color?: ColorToken;
}

/**
 * Text of the shared components and of new screens. The size follows the
 * system font scale; pass `maxFontSizeMultiplier` only where a cap is
 * unavoidable (never below 2, the 200 % criterion).
 */
export function AppText({ variant = 'body', color = 'onSurface', style, ...rest }: AppTextProps) {
  const C = useThemeColors();
  return <Text {...rest} style={[TextVariants[variant], { color: C[color] }, style]} />;
}
