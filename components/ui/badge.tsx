import { MaterialIcons } from '@expo/vector-icons';
import { View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { Radii, Sizes, Spacing, TextVariants, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';

export type BadgeVariant = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'neutral';

// Container / on-container pairs, AA in both themes (light / dark):
// primary 13.3 / 13.3, secondary 4.56 / 7.25, tertiary 4.58 / 7.25,
// error 7.24 / 7.24, success 10.0 / 7.81, neutral 7.61 / 8.57.
const PALETTE: Record<BadgeVariant, { bg: ColorToken; fg: ColorToken }> = {
  primary: { bg: 'primaryFixed', fg: 'onPrimaryFixed' },
  secondary: { bg: 'secondaryContainer', fg: 'onSecondaryContainer' },
  tertiary: { bg: 'tertiaryContainer', fg: 'onTertiaryContainer' },
  error: { bg: 'errorContainer', fg: 'onErrorContainer' },
  success: { bg: 'successContainer', fg: 'onSuccessContainer' },
  neutral: { bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant' },
};

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  /**
   * Status pill ("En ligne", "En attente"): rounded, with a leading dot or
   * icon so the status is not told by colour alone.
   */
  status?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

/**
 * Small non-interactive label: a tag on a card (square corners) or a status
 * pill (`status`). TalkBack reads the label as plain text.
 */
export function Badge({ label, variant = 'neutral', status = false, icon, style }: BadgeProps) {
  const C = useThemeColors();
  const p = PALETTE[variant];
  // The dot or icon is centred on the first line of the label, so it stays put
  // when a large font size wraps the label onto several lines (QA-34).
  const { fontScale } = useWindowDimensions();
  const firstLine = (TextVariants.caption.lineHeight ?? Sizes.iconSm) * fontScale;
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          alignSelf: 'flex-start',
          flexShrink: 1,
          gap: Spacing.xs,
          paddingHorizontal: status ? Spacing.ms : Spacing.sm,
          paddingVertical: Spacing.xxs,
          borderRadius: status ? Radii.full : Radii.badge,
          backgroundColor: C[p.bg],
        },
        style,
      ]}
    >
      {icon || status ? (
        <View style={{ height: firstLine, justifyContent: 'center' }}>
          {icon ? (
            <MaterialIcons name={icon} size={Sizes.iconSm} color={C[p.fg]} />
          ) : (
            <View
              style={{ width: Spacing.sm, height: Spacing.sm, borderRadius: Radii.full, backgroundColor: C[p.fg] }}
            />
          )}
        </View>
      ) : null}
      <AppText variant="caption" color={p.fg} style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </View>
  );
}
