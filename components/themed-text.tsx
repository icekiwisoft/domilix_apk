import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/constants/theme';

export type TextVariant = keyof typeof Typography;

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: TextVariant;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'bodyMd',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'onSurface');

  return (
    <Text style={[{ color }, Typography[variant], style]} {...rest} />
  );
}
