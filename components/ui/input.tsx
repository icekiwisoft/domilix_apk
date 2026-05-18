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

export function Input({ label, error, containerStyle, leftElement, rightElement, onFocus, onBlur, value, placeholder, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const floatAnim = useSharedValue(value ? 1 : 0);

  const surface = useThemeColor({}, 'surface');
  const primary = useThemeColor({}, 'primary');
  const outlineVariant = useThemeColor({}, 'outlineVariant');
  const onSurface = useThemeColor({}, 'onSurface');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const errorColor = useThemeColor({}, 'error');

  const borderColor = error ? errorColor : isFocused ? primary : outlineVariant;
  const borderWidth = isFocused || !!error ? 2 : 1;
  const labelColor = error ? errorColor : isFocused ? primary : onSurfaceVariant;

  // Label animates from resting (inside field) to floating (above field)
  const labelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatAnim.value, [0, 1], [18, 0]) }],
    fontSize: interpolate(floatAnim.value, [0, 1], [16, 12]),
  }));

  function handleFocus(e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    setIsFocused(true);
    floatAnim.value = withTiming(1, { duration: 180 });
    onFocus?.(e);
  }

  function handleBlur(e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    setIsFocused(false);
    if (!value) floatAnim.value = withTiming(0, { duration: 180 });
    onBlur?.(e);
  }

  return (
    <View style={containerStyle}>
      <View style={[styles.container, { backgroundColor: surface, borderColor, borderWidth }]}>
        <Animated.Text
          style={[
            styles.label,
            { color: labelColor, left: leftElement ? Spacing.md + 28 : Spacing.md },
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
            placeholderTextColor={onSurfaceVariant + '99'}
            {...rest}
          />
          {rightElement}
        </View>
      </View>
      {error && (
        <Text style={[Typography.caption, styles.errorText, { color: errorColor }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    paddingTop: 28,
    paddingBottom: 12,
    paddingHorizontal: Spacing.md,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: Spacing.md,
    top: 8,
    ...Typography.bodyMd,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftElement: {
    marginRight: Spacing.sm,
  },
  input: {
    ...Typography.bodyMd,
    flex: 1,
    padding: 0,
    margin: 0,
  },
  errorText: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
  },
});
