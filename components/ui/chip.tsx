import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Spacing, Typography } from '@/constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const primary = useThemeColor({}, 'primary');
  const onPrimary = useThemeColor({}, 'onPrimary');
  const outlineVariant = useThemeColor({}, 'outlineVariant');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');

  const bgColor = selected ? primary : 'transparent';
  const textColor = selected ? onPrimary : onSurfaceVariant;
  const borderColor = selected ? primary : outlineVariant;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bgColor, borderColor },
        pressed && { opacity: 0.75 },
      ]}
      onPress={onPress}
    >
      <Text style={[Typography.labelSm, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
