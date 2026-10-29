import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';

import { Chip } from './chip';
import type { IconName } from './icon-button';

export interface ChipOption<T extends string | number> {
  value: T;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

interface ChipGroupBase<T extends string | number> {
  options: readonly ChipOption<T>[];
  /** Read by TalkBack for the group, e.g. "Type de bien". */
  label: string;
  /** wrap: chips flow onto several lines; scroll: one horizontal line. */
  layout?: 'wrap' | 'scroll';
  style?: StyleProp<ViewStyle>;
}

export type ChipGroupProps<T extends string | number> = ChipGroupBase<T> &
  (
    | { multiple?: false; value: T | null; onChange: (value: T) => void }
    | { multiple: true; value: readonly T[]; onChange: (value: T[]) => void }
  );

/**
 * A set of Chips. Single selection is a radio group (TalkBack: "1 sur 4");
 * `multiple` toggles values in and out of the array. With `layout="scroll"`
 * the row scrolls horizontally, inset on Spacing.marginMobile.
 */
export function ChipGroup<T extends string | number>(props: ChipGroupProps<T>) {
  const { options, label, layout = 'wrap', style } = props;
  const isOn = (v: T) => (props.multiple ? props.value.includes(v) : props.value === v);
  const toggle = (v: T) => {
    if (props.multiple) {
      props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    } else {
      props.onChange(v);
    }
  };
  const chips = options.map((o) => (
    <Chip
      key={String(o.value)}
      label={o.label}
      icon={o.icon}
      disabled={o.disabled}
      selected={isOn(o.value)}
      selection={props.multiple ? 'multiple' : 'single'}
      onPress={() => toggle(o.value)}
    />
  ));
  const groupA11y = {
    accessibilityRole: props.multiple ? undefined : ('radiogroup' as const),
    accessibilityLabel: label,
  };
  if (layout === 'scroll') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        {...groupA11y}
        style={style}
        contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.marginMobile }}
      >
        {chips}
      </ScrollView>
    );
  }
  return (
    <View {...groupA11y} style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, style]}>
      {chips}
    </View>
  );
}
