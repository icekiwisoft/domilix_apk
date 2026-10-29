import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Borders, Opacity, Radii, Sizes, Spacing, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';

export interface ChipProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  selected?: boolean;
  /** `multiple` (filters, checkbox) or `single` (one choice in a group, radio). */
  selection?: 'multiple' | 'single';
  icon?: IconName;
  /**
   * Removable chip (active filter "Douala ×"): the whole 48 dp chip removes
   * it, read by TalkBack as "Retirer le filtre …". `selected` is ignored.
   */
  onRemove?: () => void;
  /** Container style (margins, alignSelf). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Selectable chip, 48 dp high. Selection is shown by a check mark as well as
 * the colour (not by colour alone), and the label wraps at large font sizes.
 * Contrast: onPrimary on primary 7:1; onSurfaceVariant on the page 8.9:1;
 * `outline` border 4.3:1 (3:1 needed); removable chip onPrimaryFixed on
 * primaryFixed 13:1.
 */
export function Chip({
  label,
  selected = false,
  selection = 'multiple',
  icon,
  onRemove,
  disabled,
  accessibilityLabel,
  onPress,
  style,
  ...rest
}: ChipProps) {
  const C = useThemeColors();
  const removable = !!onRemove;
  const on = selected && !removable;
  const fgToken: ColorToken = removable ? 'onPrimaryFixed' : on ? 'onPrimary' : 'onSurfaceVariant';
  const leading = on ? 'check' : icon;
  return (
    <Pressable
      accessibilityRole={removable ? 'button' : selection === 'single' ? 'radio' : 'checkbox'}
      accessibilityLabel={accessibilityLabel ?? (removable ? `Retirer le filtre ${label}` : label)}
      accessibilityState={removable ? { disabled: !!disabled } : { checked: on, disabled: !!disabled }}
      disabled={disabled}
      onPress={removable ? () => onRemove() : onPress}
      android_ripple={{ color: C.ripple }}
      style={({ pressed }) => [
        {
          minHeight: Sizes.touchTarget,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
          borderRadius: Radii.full,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          flexShrink: 1,
          gap: Spacing.xs,
          backgroundColor: removable ? C.primaryFixed : on ? C.primary : 'transparent',
          borderWidth: Borders.thin,
          borderColor: removable ? C.primaryFixed : on ? C.primary : C.outline,
          opacity: disabled ? Opacity.disabled : 1,
        },
        pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
        style,
      ]}
      {...rest}
    >
      {leading ? <MaterialIcons name={leading} size={Sizes.iconSm} color={C[fgToken]} /> : null}
      <AppText variant="label" color={fgToken} style={{ flexShrink: 1 }}>
        {label}
      </AppText>
      {removable ? <MaterialIcons name="close" size={Sizes.iconSm} color={C[fgToken]} /> : null}
    </Pressable>
  );
}
