import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Spacing, Typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'icon';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  label,
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const onPrimary = useThemeColor({}, 'onPrimary');
  // CTA uses primaryContainer (Bright Orange) – reserved for "Contacter" / "Réserver"
  const primaryContainer = useThemeColor({}, 'primaryContainer');
  const outlineVariant = useThemeColor({}, 'outlineVariant');
  const onSurface = useThemeColor({}, 'onSurface');

  const bgColor =
    variant === 'primary' ? primary :
    variant === 'cta' ? primaryContainer :
    'transparent';

  const textColor = variant === 'ghost' ? onSurface : onPrimary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bgColor },
        variant === 'ghost' && { borderWidth: 1, borderColor: outlineVariant },
        variant === 'icon' && styles.iconBase,
        fullWidth && { width: '100%' },
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.8 },
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          {label && (
            <Text
              style={[
                Typography.labelSm,
                { color: textColor, textTransform: 'uppercase' },
                !!icon && !!label && { marginLeft: Spacing.xs },
              ]}
            >
              {label}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
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
  },
  disabled: {
    opacity: 0.4,
  },
});
