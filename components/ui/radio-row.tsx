import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Borders, Opacity, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';

export interface RadioProps {
  selected: boolean;
}

/**
 * Radio mark alone (decorative: the row carries the role). Ring `outline`
 * 4.26:1 on the page, `link` when selected (6.1:1 light, 10:1 dark).
 */
export function Radio({ selected }: RadioProps) {
  const C = useThemeColors();
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={{
        width: Sizes.radio,
        height: Sizes.radio,
        borderRadius: Radii.full,
        borderWidth: Borders.focus,
        borderColor: selected ? C.link : C.outline,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected ? (
        <View style={{ width: Sizes.radioDot, height: Sizes.radioDot, borderRadius: Radii.full, backgroundColor: C.link }} />
      ) : null}
    </View>
  );
}

export interface RadioRowProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  subtitle?: string;
  /** Leading icon (payment method, property type). */
  icon?: IconName;
  /** Element on the right, e.g. a PriceTag for a pack. */
  trailing?: ReactNode;
  selected: boolean;
  /**
   * row: list row (payment method, pack with its price on the right).
   * card: large bordered choice card (icon, title, subtitle), selected with
   * a 2 dp `link` ring (6.1:1 light, 10.9:1 dark on the page) and the filled radio.
   */
  variant?: 'row' | 'card';
  style?: StyleProp<ViewStyle>;
}

/**
 * One choice of a radio group, 48 dp or more, the whole row tappable. Put
 * several in a View with accessibilityRole="radiogroup" (or a Section).
 */
export function RadioRow({
  title,
  subtitle,
  icon,
  trailing,
  selected,
  variant = 'row',
  disabled,
  accessibilityLabel,
  style,
  ...rest
}: RadioRowProps) {
  const C = useThemeColors();
  const card = variant === 'card';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      disabled={disabled}
      android_ripple={{ color: C.ripple }}
      style={({ pressed }) => [
        {
          minHeight: Sizes.touchTarget,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.ms,
          paddingVertical: card ? Spacing.md : Spacing.sm,
          paddingHorizontal: card ? Spacing.md : Spacing.marginMobile,
          opacity: disabled ? Opacity.disabled : 1,
        },
        card
          ? {
              borderRadius: Radii.card,
              overflow: 'hidden',
              // Same outer size selected or not: the thicker ring eats into the padding.
              borderWidth: selected ? Borders.focus : Borders.thin,
              margin: selected ? 0 : Borders.focus - Borders.thin,
              // `outline` keeps the card edge at 3:1+ (4.26:1 light, 5.88:1 dark).
              borderColor: selected ? C.link : C.outline,
              backgroundColor: selected ? C.surfaceContainerLow : C.surfaceContainerLowest,
            }
          : null,
        pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
        style,
      ]}
      {...rest}
    >
      {icon ? (
        <View
          style={
            card
              ? {
                  width: Sizes.touchTarget,
                  height: Sizes.touchTarget,
                  borderRadius: Radii.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: C.surfaceContainerHigh,
                }
              : null
          }
        >
          <MaterialIcons
            name={icon}
            size={Sizes.iconLg}
            color={C.onSurfaceVariant}
          />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: Spacing.xxs }}>
        <AppText variant="bodyStrong">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="onSurfaceVariant">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
      <Radio selected={selected} />
    </Pressable>
  );
}
