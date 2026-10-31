import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, type ReactNode } from 'react';
import { AccessibilityInfo, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { Radii, Sizes, Spacing, TextVariants, type ColorToken } from '@/constants/theme';
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
  /** What TalkBack reads for the message, e.g. "Erreur : …" (default: the text). */
  accessibilityLabel?: string;
  /**
   * Announce the message when it appears (default: error banners). Pass false
   * when the banner sits in an always-mounted live region, as Field does, so it
   * is not read twice.
   */
  announce?: boolean;
}

/**
 * Inline message inside a page (tip, saved position, permission refused).
 * The icon is decorative; an `error` banner is announced by TalkBack when it
 * appears or its text changes (a live region that mounts with its text is not
 * reliably read on Android).
 */
export function Banner({
  children,
  tone = 'info',
  icon,
  action,
  style,
  accessibilityLabel,
  announce = tone === 'error',
}: BannerProps) {
  const C = useThemeColors();
  const p = PALETTE[tone];
  const spoken = accessibilityLabel ?? children;
  // The icon is centred on the first line of text, which grows with the font
  // size: at 200 % it no longer sits above the line's middle (QA-34).
  const { fontScale } = useWindowDimensions();
  const firstLine = Math.max(Sizes.icon, (TextVariants.bodySm.lineHeight ?? Sizes.icon) * fontScale);
  useEffect(() => {
    if (announce) AccessibilityInfo.announceForAccessibility(spoken);
  }, [announce, spoken]);
  return (
    <View
      style={[
        { gap: Spacing.xs, padding: Spacing.ms, borderRadius: Radii.control, backgroundColor: C[p.bg] },
        style,
      ]}
    >
      <View accessible accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm }}>
        <View style={{ height: firstLine, justifyContent: 'center' }}>
          <MaterialIcons name={icon ?? p.icon} size={Sizes.icon} color={C[p.fg]} />
        </View>
        <AppText variant="bodySm" color={p.fg} style={{ flex: 1 }}>
          {children}
        </AppText>
      </View>
      {action}
    </View>
  );
}
