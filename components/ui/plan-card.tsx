import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PlanCardProps {
  title: string;
  tagline?: string;
  price: number | null;
  period?: string;
  features: string[];
  recommended?: boolean;
  current?: boolean;
  ctaLabel?: string;
  onPress?: () => void;
}

export function PlanCard({
  title,
  tagline,
  price,
  period = '/mois',
  features,
  recommended,
  current,
  ctaLabel = 'Choisir ce plan',
  onPress,
}: PlanCardProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const borderColor = current ? C.primary : recommended ? C.primary : C.outlineVariant;
  const bg = current
    ? C.primaryContainer + '22'
    : recommended
    ? C.primaryContainer + '1A'
    : C.surface;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor, borderWidth: current || recommended ? 2 : 1 }]}>
      {recommended && !current && (
        <View style={[styles.badge, { backgroundColor: C.primary }]}>
          <Text style={[Typography.caption, { color: C.onPrimary, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 0.8, textTransform: 'uppercase' }]}>
            Recommandé
          </Text>
        </View>
      )}

      <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>
        {title}
      </Text>

      {tagline ? (
        <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 2, lineHeight: 18 }]}>
          {tagline}
        </Text>
      ) : null}

      <View style={styles.priceRow}>
        {price === null ? (
          <Text style={[Typography.headlineLg, { color: C.primary, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 28 }]}>
            Gratuit
          </Text>
        ) : (
          <>
            <Text style={[Typography.headlineLg, { color: C.primary, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 28 }]}>
              {price.toLocaleString('fr-FR')}
            </Text>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              {' FCFA'}{period}
            </Text>
          </>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: C.outlineVariant + '4D' }]} />

      <View style={styles.features}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={16} color={current ? C.primary : C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1, lineHeight: 20 }]}>
              {f}
            </Text>
          </View>
        ))}
      </View>

      <Button
        mode={recommended && !current ? 'contained' : 'outlined'}
        icon={current ? 'check-circle' : undefined}
        disabled={current}
        onPress={onPress}
        style={styles.cta}
      >
        {current ? 'Plan actuel' : ctaLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    overflow: 'hidden',
    gap: Spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  divider: {
    height: 1,
  },
  features: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cta: {
    borderRadius: Radius.md,
  },
});
