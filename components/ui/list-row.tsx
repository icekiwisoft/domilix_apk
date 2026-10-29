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
import { pressedStyle } from './pressed';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  /** Read by TalkBack. In a row, use ListRow switchValue instead (the row speaks). */
  accessibilityLabel?: string;
}

/**
 * The native switch alone, hidden from accessibility and touch: the
 * element around it (Switch below or a ListRow) is the single TalkBack stop
 * and the touch target. Off: `outline` track (4.3:1 on the page, 3:1
 * needed) and a light thumb; on: primaryContainer track. The thumb position
 * also tells the state, so it does not rely on colour alone.
 */
function SwitchTrack({ value, disabled }: { value: boolean; disabled?: boolean }) {
  const C = useThemeColors();
  return (
    <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden pointerEvents="none">
      <RNSwitch
        value={value}
        disabled={disabled}
        accessible={false}
        importantForAccessibility="no"
        focusable={false}
        trackColor={{ false: C.outline, true: C.primaryContainer }}
        thumbColor={value ? C.onPrimaryContainer : C.surfaceContainerLowest}
        ios_backgroundColor={C.outline}
      />
    </View>
  );
}

/**
 * Standalone themed switch: the native switch is 46 x 27 dp, so it sits in a
 * 48 x 48 dp pressable that carries the role, state and label (same look,
 * full touch target).
 */
export function Switch({ value, onValueChange, disabled, accessibilityLabel }: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={{ minWidth: Sizes.touchTarget, minHeight: Sizes.touchTarget, alignItems: 'center', justifyContent: 'center' }}
    >
      <SwitchTrack value={value} disabled={disabled} />
    </Pressable>
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
 * right. TalkBack reads it as one item (title, subtitle, value); a switch
 * row is one switch stop labelled by its title, the inner switch hidden.
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
  // A switch row is read "title, switch, on/off", the subtitle as a hint.
  const spoken = accessibilityLabel ?? (isSwitch ? title : [title, subtitle, value].filter(Boolean).join(', '));
  return (
    <Pressable
      accessibilityRole={isSwitch ? 'switch' : pressable ? 'button' : undefined}
      accessibilityLabel={spoken}
      accessibilityHint={isSwitch && !accessibilityLabel ? subtitle : undefined}
      accessibilityState={isSwitch ? { checked: switchValue, disabled: !!disabled } : { disabled: !!disabled }}
      disabled={disabled || !pressable}
      onPress={isSwitch ? () => onSwitchChange?.(!switchValue) : onPress}
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
        pressedStyle(pressed),
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
      {isSwitch ? <SwitchTrack value={!!switchValue} disabled={!!disabled} /> : null}
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
      <Card padding="none" accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityRole ? title : undefined} style={{ gap: 0 }}>
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
