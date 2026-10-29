import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { GoogleLogo } from '@/components/auth/google-logo';
import { Borders, Opacity, Radii, Sizes, Spacing, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';
import { pressedStyle } from './pressed';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger' | 'google';
export type ButtonSize = 'md' | 'lg';

// Contrast (AA): onCta on cta 8.5:1 (light) and 10.1:1 (dark); onSurface on
// the page 16:1; link 6.1:1; onError on error 6.5:1; Google's pairs 14:1+. The
// secondary outline (`outline`) reaches 4.3:1 against the page (3:1 needed).
const PALETTE: Record<ButtonVariant, { bg: ColorToken | null; fg: ColorToken; border: ColorToken | null }> = {
  primary: { bg: 'cta', fg: 'onCta', border: null },
  secondary: { bg: null, fg: 'onSurface', border: 'outline' },
  text: { bg: null, fg: 'link', border: null },
  danger: { bg: 'error', fg: 'onError', border: null },
  google: { bg: 'googleSurface', fg: 'onGoogleSurface', border: 'googleOutline' },
};

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  /** md: 48 dp minimum; lg: 52 dp, the full-width buttons of forms. */
  size?: ButtonSize;
  /** MaterialIcons name shown before the label (the Google logo for `google`). */
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pill button of the app. The label wraps instead of being cut at 200 %
 * font size, and the button grows with it. While `loading` it stays the same
 * size, is disabled and reports itself busy to TalkBack.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const C = useThemeColors();
  const p = PALETTE[variant];
  const inactive = !!disabled || loading;
  const fg = C[p.fg];

  let leading = null;
  if (loading) leading = <ActivityIndicator size="small" color={fg} />;
  else if (variant === 'google') leading = <GoogleLogo size={Sizes.icon} />;
  else if (icon) leading = <MaterialIcons name={icon} size={Sizes.icon} color={fg} />;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        {
          minHeight: size === 'lg' ? Sizes.control : Sizes.touchTarget,
          minWidth: Sizes.touchTarget,
          paddingHorizontal: variant === 'text' ? Spacing.ms : size === 'lg' ? Spacing.lg : Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: Radii.full,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          backgroundColor: p.bg ? C[p.bg] : 'transparent',
          borderWidth: p.border ? Borders.thin : 0,
          borderColor: p.border ? C[p.border] : undefined,
          opacity: disabled && !loading ? Opacity.disabled : 1,
        },
        fullWidth ? { alignSelf: 'stretch' } : null,
        pressedStyle(pressed),
        style,
      ]}
      {...rest}
    >
      {leading ? <View>{leading}</View> : null}
      <AppText variant="bodyStrong" color={p.fg} style={{ textAlign: 'center', flexShrink: 1 }}>
        {label}
      </AppText>
    </Pressable>
  );
}
