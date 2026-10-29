import { MaterialIcons } from '@expo/vector-icons';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import {
  Pressable,
  Switch as RNSwitch,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Opacity, Sizes, Spacing, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { Card } from './card';
import { Divider } from './divider';
import type { IconName } from './icon-button';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  /** Read by TalkBack; leave empty when the Switch sits in a ListRow (the row speaks). */
  accessibilityLabel?: string;
}

/**
 * Themed switch. Off: `outline` track (4.3:1 on the page, 3:1 needed) and a
 * white thumb; on: primaryContainer track. The thumb position also tells
 * the state, so it does not rely on colour alone.
 */
export function Switch({ value, onValueChange, disabled, accessibilityLabel }: SwitchProps) {
  const C = useThemeColors();
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: C.outline, true: C.primaryContainer }}
      thumbColor={value ? C.onPrimaryContainer : C.surfaceContainerLowest}
      ios_backgroundColor={C.outline}
    />
  );
}

export interface ListRowProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Text on the right, e.g. "Français" or "3 annonces". */
  value?: string;
  /** Chevron on the right: the row opens another screen. Defaults to true when onPress is set. */
  chevron?: boolean;
  /** Turns the row into a switch: the whole row toggles it, read as a switch. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  /** Custom element on the right (badge, etc.), after `value`. */
  trailing?: ReactNode;
  /** Destructive action ("Se déconnecter", "Supprimer le compte"): `error` colour. */
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Settings / profile row, 56 dp with a subtitle, 48 dp minimum: leading icon,
 * title and subtitle that wrap at 200 %, value, chevron or switch on the
 * right. TalkBack reads it as one item (title, subtitle, value).
 */
export function ListRow({
  title,
  subtitle,
  icon,
  value,
  chevron,
  switchValue,
  onSwitchChange,
  trailing,
  destructive = false,
  onPress,
  disabled,
  accessibilityLabel,
  style,
  ...rest
}: ListRowProps) {
  const C = useThemeColors();
  const isSwitch = switchValue !== undefined;
  const pressable = isSwitch ? !!onSwitchChange : !!onPress;
  const showChevron = !isSwitch && (chevron ?? !!onPress);
  const titleColor: ColorToken = destructive ? 'error' : 'onSurface';
  const spoken = accessibilityLabel ?? [title, subtitle, value].filter(Boolean).join(', ');
  return (
    <Pressable
      accessibilityRole={isSwitch ? 'switch' : pressable ? 'button' : undefined}
      accessibilityLabel={spoken}
      accessibilityState={isSwitch ? { checked: switchValue, disabled: !!disabled } : { disabled: !!disabled }}
      disabled={disabled || !pressable}
      onPress={isSwitch ? () => onSwitchChange?.(!switchValue) : onPress}
      android_ripple={pressable ? { color: C.ripple } : undefined}
      style={({ pressed }) => [
        {
          minHeight: subtitle ? Sizes.touchTarget + Spacing.sm : Sizes.touchTarget,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          opacity: disabled ? Opacity.disabled : 1,
        },
        pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
        style,
      ]}
      {...rest}
    >
      {icon ? <MaterialIcons name={icon} size={Sizes.iconLg} color={destructive ? C.error : C.onSurfaceVariant} /> : null}
      <View style={{ flex: 1, gap: Spacing.xxs }}>
        <AppText variant="bodyStrong" color={titleColor}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="onSurfaceVariant">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="label" color="onSurfaceVariant" style={{ flexShrink: 1, textAlign: 'right' }}>
          {value}
        </AppText>
      ) : null}
      {trailing}
      {isSwitch ? (
        <View importantForAccessibility="no-hide-descendants" pointerEvents="none">
          <Switch value={!!switchValue} onValueChange={(v) => onSwitchChange?.(v)} disabled={!!disabled} />
        </View>
      ) : null}
      {showChevron ? <MaterialIcons name="chevron-right" size={Sizes.iconLg} color={C.onSurfaceVariant} /> : null}
    </Pressable>
  );
}

export interface SectionProps {
  /** Section title above the card, read as a header. */
  title?: string;
  /** Note under the card. */
  footer?: string;
  /** ListRows (or RadioRows), separated by dividers inside one card. */
  children: ReactNode;
  /** radiogroup for a set of RadioRows. */
  accessibilityRole?: 'radiogroup';
  style?: StyleProp<ViewStyle>;
}

/** Titled group of rows in one card (profile, settings, payment method). */
export function Section({ title, footer, children, accessibilityRole, style }: SectionProps) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[{ gap: Spacing.sm }, style]}>
      {title ? (
        <AppText variant="label" color="onSurfaceVariant" accessibilityRole="header" style={{ paddingHorizontal: Spacing.xs }}>
          {title}
        </AppText>
      ) : null}
      <Card padding="none" accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityRole ? title : undefined} style={{ gap: 0, overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 ? <Divider style={{ marginLeft: Spacing.md }} /> : null}
            {row}
          </Fragment>
        ))}
      </Card>
      {footer ? (
        <AppText variant="caption" color="onSurfaceVariant" style={{ paddingHorizontal: Spacing.xs }}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}
