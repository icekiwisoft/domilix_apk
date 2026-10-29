import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, type PressableProps } from 'react-native';

import { Borders, Opacity, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';

export interface ChipProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  selected?: boolean;
  /** `multiple` (filters, checkbox) or `single` (one choice in a group, radio). */
  selection?: 'multiple' | 'single';
  icon?: IconName;
}

/**
 * Selectable chip, 48 dp high. Selection is shown by a check mark as well as
 * the colour (not by colour alone), and the label wraps at large font sizes.
 * Contrast: onPrimary on primary 7:1; onSurfaceVariant on the page 8.9:1;
 * `outline` border 4.3:1 (3:1 needed).
 */
export function Chip({ label, selected = false, selection = 'multiple', icon, disabled, accessibilityLabel, ...rest }: ChipProps) {
  const C = useThemeColors();
  const fg = selected ? C.onPrimary : C.onSurfaceVariant;
  const leading = selected ? 'check' : icon;
  return (
    <Pressable
      accessibilityRole={selection === 'single' ? 'radio' : 'checkbox'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      disabled={disabled}
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
          backgroundColor: selected ? C.primary : 'transparent',
          borderWidth: Borders.thin,
          borderColor: selected ? C.primary : C.outline,
          opacity: disabled ? Opacity.disabled : 1,
        },
        pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
      ]}
      {...rest}
    >
      {leading ? <MaterialIcons name={leading} size={Sizes.iconSm} color={fg} /> : null}
      <AppText variant="label" color={selected ? 'onPrimary' : 'onSurfaceVariant'} style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </Pressable>
  );
}
