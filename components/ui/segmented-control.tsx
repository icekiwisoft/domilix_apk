import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { Radii, Shadows, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';
import { pressedStyle } from './pressed';

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
 * a semi-bold label and, with two segments, a check mark (left out from three
 * segments, where it no longer fits), not by colour alone. At large font
 * sizes the segments wrap onto several rows instead of truncating.
 * Contrast: onSurface on the raised segment 17:1, onSurfaceVariant on the
 * track 7.61:1 (light) / 8.57:1 (dark).
 */
export function SegmentedControl<T extends string>({ options, value, onChange, label, style }: SegmentedControlProps<T>) {
  const C = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const large = fontScale >= WRAP_SCALE;
  const crowded = options.length > 2;
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
        // With three segments or more the check mark no longer fits beside a
        // label such as "Annonces" (cut to "Annonce / s", UI-08): the raised
        // surface and the semi-bold label still tell the selection.
        const icon = on && !crowded ? 'check' : o.icon;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [
              {
                flexGrow: 1,
                flexBasis: large ? '100%' : 0,
                minHeight: Sizes.touchTarget,
                paddingHorizontal: crowded ? Spacing.sm : Spacing.ms,
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
              pressedStyle(pressed),
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
