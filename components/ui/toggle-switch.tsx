import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface ToggleSwitchProps<T extends string> {
  options: [SegmentOption<T>, SegmentOption<T>];
  value: T;
  onChange: (value: T) => void;
}

export function ToggleSwitch<T extends string>({ options, value, onChange }: ToggleSwitchProps<T>) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={[styles.track, { backgroundColor: C.surfaceContainer }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.option,
              active && [styles.activeOption, { backgroundColor: C.surface }],
            ]}
          >
            <Text
              style={[
                Typography.labelSm,
                {
                  color: active ? C.primary : C.onSurfaceVariant,
                  textTransform: 'uppercase',
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOption: {
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
