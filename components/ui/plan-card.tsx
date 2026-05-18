import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PlanCardProps {
  title: string;
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

  const borderColor = recommended ? C.primary : C.outlineVariant;
  const bg = recommended ? C.primaryContainer + '1A' : C.surface;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor, borderWidth: recommended ? 2 : 1 }]}>
      {recommended && (
        <View style={[styles.recommendedBadge, { backgroundColor: C.primary }]}>
          <Text style={[Typography.caption, { color: C.onPrimary, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 0.8, textTransform: 'uppercase' }]}>
            Recommandé
          </Text>
        </View>
      )}

      <Text style={[Typography.headlineMd, styles.planTitle, { color: C.onSurface, fontSize: 20 }]}>
        {title}
      </Text>

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
            <MaterialIcons name="check-circle" size={16} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1, lineHeight: 20 }]}>
              {f}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onPress}
        style={[
          styles.cta,
          {
            backgroundColor: recommended ? C.primary : 'transparent',
            borderColor: current ? C.outlineVariant : C.primary,
            borderWidth: 1.5,
          },
        ]}
      >
        <Text style={[
          Typography.labelSm,
          {
            color: recommended ? C.onPrimary : C.primary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          },
        ]}>
          {current ? 'Plan actuel' : ctaLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  planTitle: {
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  features: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cta: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
