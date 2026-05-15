import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Spacing, Typography } from '@/constants/theme';

export type BadgeVariant = 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
  const tertiary = useThemeColor({}, 'tertiary');
  const error = useThemeColor({}, 'error');
  const outlineVariant = useThemeColor({}, 'outlineVariant');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');

  const colorMap: Record<BadgeVariant, { bg: string; fg: string }> = {
    primary:   { bg: hexToRgba(primary, 0.12),   fg: primary },
    secondary: { bg: hexToRgba(secondary, 0.12), fg: secondary },
    tertiary:  { bg: hexToRgba(tertiary, 0.12),  fg: tertiary },
    error:     { bg: hexToRgba(error, 0.12),     fg: error },
    neutral:   { bg: hexToRgba(outlineVariant, 0.3), fg: onSurfaceVariant },
  };

  const { bg, fg } = colorMap[variant];

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={[Typography.labelSm, { color: fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
});
