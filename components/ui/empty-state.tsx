import { StyleSheet, View, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Spacing } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ title, description, ctaLabel, onCta, icon, style }: EmptyStateProps) {
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const primary = useThemeColor({}, 'primary');
  const primaryFixed = useThemeColor({}, 'primaryFixed');

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={[styles.iconCircle, { backgroundColor: primaryFixed }]}>
          {icon}
        </View>
      )}
      <ThemedText variant="headlineMd" style={styles.title}>
        {title}
      </ThemedText>
      {description && (
        <ThemedText
          variant="bodyMd"
          lightColor={onSurfaceVariant}
          darkColor={onSurfaceVariant}
          style={styles.description}
        >
          {description}
        </ThemedText>
      )}
      {ctaLabel && onCta && (
        <Button variant="primary" label={ctaLabel} onPress={onCta} style={styles.cta} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: 2,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  cta: {
    marginTop: Spacing.md,
    minWidth: 180,
  },
});
