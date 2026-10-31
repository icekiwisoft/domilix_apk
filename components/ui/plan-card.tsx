import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Borders, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { Divider } from './divider';
import { PriceTag } from './price-tag';

export interface PlanCardProps {
  title: string;
  tagline?: string;
  /** Price in FCFA, or null for a free plan. */
  price: number | null;
  credits?: number;
  validityLabel?: string;
  features: string[];
  /** Website "Recommandé" pack: badge, link-coloured ring and a filled button. */
  recommended?: boolean;
  ctaLabel?: string;
  onPress?: () => void;
}

/**
 * Domicoin pack card (website Subscriptions view): title, benefit, credits
 * and validity, one-off price, features and the buy button. A pack is not a
 * recurring plan (several can be active at once), so there is no "current
 * plan" state (B-06): the active packs are listed above the cards instead.
 */
export function PlanCard({
  title,
  tagline,
  price,
  credits,
  validityLabel,
  features,
  recommended = false,
  ctaLabel = 'Acheter ce pack',
  onPress,
}: PlanCardProps) {
  const C = useThemeColors();
  return (
    <Card
      outlined
      style={[
        { padding: Spacing.lg, gap: Spacing.md },
        recommended ? { borderWidth: Borders.focus, borderColor: C.link } : null,
      ]}
    >
      {recommended ? <Badge label="Recommandé" variant="primary" icon="star" status /> : null}

      <View style={{ gap: Spacing.xs }}>
        <AppText variant="headline" accessibilityRole="header">
          {title}
        </AppText>
        {tagline ? <AppText color="onSurfaceVariant">{tagline}</AppText> : null}
      </View>

      {credits != null || validityLabel ? (
        <View style={{ gap: Spacing.xs }}>
          {credits != null ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <MaterialIcons name="toll" size={Sizes.icon} color={C.link} />
              <AppText variant="bodyStrong" style={{ flexShrink: 1 }}>
                {credits} Domicoins
              </AppText>
            </View>
          ) : null}
          {validityLabel ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <MaterialIcons name="schedule" size={Sizes.icon} color={C.onSurfaceVariant} />
              <AppText color="onSurfaceVariant" style={{ flexShrink: 1 }}>
                {validityLabel}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}

      {price === null ? (
        <AppText variant="price" color="link">
          Gratuit
        </AppText>
      ) : (
        <PriceTag amount={price} />
      )}

      <Divider />

      <View style={{ gap: Spacing.sm }}>
        {features.map((f) => (
          <View key={f} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm }}>
            <MaterialIcons
              name="check-circle"
              size={Sizes.icon}
              color={C.success}
              style={{ marginTop: Spacing.xxs }}
            />
            <AppText style={{ flex: 1 }}>{f}</AppText>
          </View>
        ))}
      </View>

      <Button
        label={ctaLabel}
        variant={recommended ? 'primary' : 'secondary'}
        fullWidth
        accessibilityLabel={`${ctaLabel}, ${title}`}
        onPress={onPress}
      />
    </Card>
  );
}
