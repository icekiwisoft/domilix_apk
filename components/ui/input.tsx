import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Spacing, Typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  leftElement,
  rightElement,
  onFocus,
  onBlur,
  value,
  placeholder,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const floatAnim = useSharedValue(value ? 1 : 0);
  const focusAnim = useSharedValue(0);

  const surface = useThemeColor({}, 'surface');
  const primary = useThemeColor({}, 'primary');
  const outlineVariant = useThemeColor({}, 'outlineVariant');
  const onSurface = useThemeColor({}, 'onSurface');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const errorColor = useThemeColor({}, 'error');
  const surfaceContainerLow = useThemeColor({}, 'surfaceContainerLow');

  const borderColor = error ? errorColor : isFocused ? primary : outlineVariant;
  const borderWidth = isFocused || !!error ? 2 : 1;
  const labelColor = error ? errorColor : isFocused ? primary : onSurfaceVariant;

  const labelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatAnim.value, [0, 1], [18, 0]) }],
    fontSize: interpolate(floatAnim.value, [0, 1], [16, 11.5]),
    opacity: interpolate(floatAnim.value, [0, 0.5, 1], [0.6, 0.8, 1]),
  }));

  // Subtle background tint when focused
  const containerAnimStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focusAnim.value,
      [0, 1],
      [surface, surfaceContainerLow]
    ),
  }));

  function handleFocus(e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    setIsFocused(true);
    floatAnim.value = withTiming(1, { duration: 200 });
    focusAnim.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  }

  function handleBlur(e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
    if (!value) floatAnim.value = withTiming(0, { duration: 180 });
    onBlur?.(e);
  }

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          styles.container,
          { borderColor, borderWidth },
          containerAnimStyle,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            { color: labelColor, left: leftElement ? Spacing.md + 30 : Spacing.md },
            labelAnimStyle,
          ]}
        >
          {label}
        </Animated.Text>
        <View style={styles.inputRow}>
          {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
          <TextInput
            style={[styles.input, { color: onSurface }]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            placeholder={isFocused ? placeholder : undefined}
            placeholderTextColor={onSurfaceVariant + '88'}
            selectionColor={primary}
            {...rest}
          />
          {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
        </View>
      </Animated.View>
      {error && (
        <View style={styles.errorRow}>
          <Text style={[Typography.caption, styles.errorText, { color: errorColor }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    paddingTop: 26,
    paddingBottom: 12,
    paddingHorizontal: Spacing.md,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    top: 8,
    ...Typography.bodyMd,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  leftElement: {
    flexShrink: 0,
  },
  rightElement: {
    flexShrink: 0,
  },
  input: {
    ...Typography.bodyMd,
    flex: 1,
    padding: 0,
    margin: 0,
    minHeight: 24,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
  },
  errorText: {
    flex: 1,
  },
});
