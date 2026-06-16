import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';

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

  // Animate the active pill sliding between options
  const translateX = useSharedValue(value === options[0].value ? 0 : 1);

  useEffect(() => {
    translateX.value = withTiming(value === options[0].value ? 0 : 1, { duration: 180 });
  }, [value, options, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    left: `${translateX.value * 50}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: C.surfaceContainerHighest }]}>
      {/* Sliding active pill */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: C.surface },
          pillStyle,
          Shadows.xs,
        ]}
      />

      {/* Options */}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={styles.option}
            hitSlop={4}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: active ? C.primary : C.onSurfaceVariant },
                active && { fontFamily: 'PlusJakartaSans_700Bold' },
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
    borderRadius: Radius.full,
    padding: 3,
    position: 'relative',
    alignSelf: 'flex-start',
    minWidth: 160,
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '50%',
    borderRadius: Radius.full,
  },
  option: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'none',
  },
});
