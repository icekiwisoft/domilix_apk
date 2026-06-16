import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'icon' | 'outline';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  variant = 'primary',
  label,
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  size = 'md',
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const onPrimary = useThemeColor({}, 'onPrimary');
  const primaryContainer = useThemeColor({}, 'primaryContainer');
  const outlineVariant = useThemeColor({}, 'outlineVariant');
  const onSurface = useThemeColor({}, 'onSurface');
  const surface = useThemeColor({}, 'surface');

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn(e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) {
    scale.value = withTiming(0.96, { duration: 100 });
    onPressIn?.(e);
  }
  function handlePressOut(e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) {
    scale.value = withTiming(1, { duration: 150 });
    onPressOut?.(e);
  }

  const bgColor =
    variant === 'primary' ? primary :
    variant === 'cta' ? primaryContainer :
    variant === 'outline' ? 'transparent' :
    variant === 'ghost' ? 'transparent' :
    'transparent';

  const textColor =
    variant === 'ghost' || variant === 'outline' ? onSurface :
    onPrimary;

  const borderColor =
    variant === 'outline' ? outlineVariant :
    variant === 'ghost' ? outlineVariant :
    'transparent';

  const isDisabled = disabled || loading;

  const paddingVertical =
    size === 'sm' ? 10 :
    size === 'lg' ? 18 :
    14;

  const shadow = (variant === 'primary' || variant === 'cta') && !isDisabled ? Shadows.button : {};

  return (
    <AnimatedPressable
      style={[animStyle, fullWidth && { width: '100%' }]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      {...rest}
    >
      <Animated.View
        style={[
          styles.base,
          { backgroundColor: bgColor, paddingVertical, borderColor, borderWidth: variant === 'outline' || variant === 'ghost' ? 1.5 : 0 },
          variant === 'icon' && styles.iconBase,
          isDisabled && styles.disabled,
          shadow,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon}
            {label && (
              <Text
                style={[
                  styles.label,
                  { color: textColor },
                  size === 'sm' && { fontSize: 12, letterSpacing: 0.8 },
                  size === 'lg' && { fontSize: 15, letterSpacing: 1.4 },
                  !!icon && !!label && { marginLeft: Spacing.xs },
                ]}
              >
                {label}
              </Text>
            )}
          </>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    minHeight: 48,
  },
  iconBase: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 44,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.42,
  },
});
