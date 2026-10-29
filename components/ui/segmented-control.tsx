import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { Opacity, Radii, Shadows, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface SegmentedControlProps<T extends string> {
  /** 2 to 4 options (Liste / Carte, À louer / À vendre). */
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Read by TalkBack for the group. */
  label: string;
  style?: StyleProp<ViewStyle>;
}

/** fontScale from which segments may wrap onto two rows. */
const WRAP_SCALE = 1.5;

/**
 * Pill track with one raised segment (replaces Paper SegmentedButtons). Each
 * segment is a 48 dp radio; the selected one is shown by its raised surface,
 * a check mark and a semi-bold label, not by colour alone. At large font
 * sizes the segments wrap onto several rows instead of truncating.
 * Contrast: onSurface on the raised segment 17:1, onSurfaceVariant on the
 * track 7.61:1 (light) / 8.57:1 (dark).
 */
export function SegmentedControl<T extends string>({ options, value, onChange, label, style }: SegmentedControlProps<T>) {
  const C = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const large = fontScale >= WRAP_SCALE;
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.xxs,
          padding: Spacing.xs,
          borderRadius: large ? Radii.card : Radii.full,
          backgroundColor: C.surfaceContainerHigh,
        },
        style,
      ]}
    >
      {options.map((o) => {
        const on = o.value === value;
        const icon = on ? 'check' : o.icon;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            android_ripple={{ color: C.ripple }}
            style={({ pressed }) => [
              {
                flexGrow: 1,
                flexBasis: large ? '100%' : 0,
                minHeight: Sizes.touchTarget,
                paddingHorizontal: Spacing.ms,
                paddingVertical: Spacing.xs,
                borderRadius: large ? Radii.control : Radii.full,
                overflow: 'hidden',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Spacing.xs,
                backgroundColor: on ? C.surfaceContainerLowest : 'transparent',
              },
              on ? Shadows.xs : null,
              pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
            ]}
          >
            {icon ? (
              <MaterialIcons name={icon} size={Sizes.iconSm} color={on ? C.onSurface : C.onSurfaceVariant} />
            ) : null}
            <AppText
              variant={on ? 'bodyStrong' : 'label'}
              color={on ? 'onSurface' : 'onSurfaceVariant'}
              style={{ textAlign: 'center', flexShrink: 1 }}
            >
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
