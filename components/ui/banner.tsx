import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, type ReactNode } from 'react';
import { AccessibilityInfo, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radii, Sizes, Spacing, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';

export type BannerTone = 'info' | 'success' | 'error';

// Contrast: onSurface on surfaceContainerHigh 14:1 (light) / 13:1 (dark);
// onSuccessContainer on successContainer 10:1 / 7.8:1; onErrorContainer on
// errorContainer 8.9:1 / 7.4:1.
const PALETTE: Record<BannerTone, { bg: ColorToken; fg: ColorToken; icon: IconName }> = {
  info: { bg: 'surfaceContainerHigh', fg: 'onSurface', icon: 'info-outline' },
  success: { bg: 'successContainer', fg: 'onSuccessContainer', icon: 'check-circle-outline' },
  error: { bg: 'errorContainer', fg: 'onErrorContainer', icon: 'error-outline' },
};

export interface BannerProps {
  children: string;
  tone?: BannerTone;
  icon?: IconName;
  /** Element under the text, e.g. a text Button "Ouvrir les réglages". */
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Inline message inside a page (tip, saved position, permission refused).
 * The icon is decorative; an `error` banner is announced by TalkBack when it
 * appears or its text changes (a live region that mounts with its text is not
 * reliably read on Android).
 */
export function Banner({ children, tone = 'info', icon, action, style }: BannerProps) {
  const C = useThemeColors();
  const p = PALETTE[tone];
  useEffect(() => {
    if (tone === 'error') AccessibilityInfo.announceForAccessibility(children);
  }, [tone, children]);
  return (
    <View
      style={[
        { gap: Spacing.xs, padding: Spacing.ms, borderRadius: Radii.control, backgroundColor: C[p.bg] },
        style,
      ]}
    >
      <View accessible style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm }}>
        <MaterialIcons name={icon ?? p.icon} size={Sizes.icon} color={C[p.fg]} />
        <AppText variant="bodySm" color={p.fg} style={{ flex: 1 }}>
          {children}
        </AppText>
      </View>
      {action}
    </View>
  );
}
