import { StyleSheet, View, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing } from '@/constants/theme';

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

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
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
        <Button variant="primary" label={ctaLabel} onPress={onCta} />
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
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
