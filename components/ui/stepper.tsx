import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { IconButton } from './icon-button';

export interface StepperProps {
  /** Shown on the left and read by TalkBack, e.g. "Chambres". */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Lighter text under the label, e.g. "Salles d'eau comprises". */
  helper?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Number picker "Chambres  − 3 +": two 48 dp buttons around the value. For
 * TalkBack the row is one adjustable control (swipe up / down to change it),
 * so the value is read with the label instead of three separate items.
 * The label goes above the buttons when the row is too narrow (200 %).
 */
export function Stepper({ label, value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, helper, style }: StepperProps) {
  const C = useThemeColors();
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={helper ? `${label}, ${helper}` : label}
      accessibilityValue={{ min, max: max === Number.MAX_SAFE_INTEGER ? undefined : max, now: value, text: String(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') set(value + step);
        if (e.nativeEvent.actionName === 'decrement') set(value - step);
      }}
      style={[
        {
          minHeight: Sizes.touchTarget,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: Spacing.md,
          rowGap: Spacing.xs,
        },
        style,
      ]}
    >
      <View style={{ flexGrow: 1, flexShrink: 1, gap: Spacing.xxs }}>
        <AppText variant="bodyStrong">{label}</AppText>
        {helper ? (
          <AppText variant="caption" color="onSurfaceVariant">
            {helper}
          </AppText>
        ) : null}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: Borders.thin,
          borderColor: C.outline,
          borderRadius: Radii.full,
        }}
      >
        <IconButton
          icon="remove"
          label={`Moins de ${label.toLowerCase()}`}
          disabled={value <= min}
          onPress={() => set(value - step)}
        />
        <AppText
          variant="bodyStrong"
          style={{ minWidth: Sizes.iconLg, textAlign: 'center', fontVariant: ['tabular-nums'] }}
        >
          {value}
        </AppText>
        <IconButton
          icon="add"
          label={`Plus de ${label.toLowerCase()}`}
          disabled={value >= max}
          onPress={() => set(value + step)}
        />
      </View>
    </View>
  );
}
