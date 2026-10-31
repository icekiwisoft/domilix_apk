import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing, type ColorToken, type TextVariant } from '@/constants/theme';

import { AppText } from './app-text';

const NBSP = ' ';

// API AdPeriod (backend prisma/schema.prisma: hour, day, night, month, year),
// a few English variants, and the French labels themselves.
const PERIODS: Record<string, string> = {
  hour: 'heure',
  hourly: 'heure',
  heure: 'heure',
  day: 'jour',
  daily: 'jour',
  jour: 'jour',
  night: 'nuit',
  nightly: 'nuit',
  nuit: 'nuit',
  week: 'semaine',
  weekly: 'semaine',
  semaine: 'semaine',
  month: 'mois',
  monthly: 'mois',
  mois: 'mois',
  year: 'an',
  yearly: 'an',
  annual: 'an',
  an: 'an',
  année: 'an',
};

/** French label of a period, or null for an unknown value (never shows raw English). */
export function periodLabel(period: string | null | undefined): string | null {
  if (!period) return null;
  return PERIODS[period.trim().toLowerCase()] ?? null;
}

export type PriceTagSize = 'sm' | 'md' | 'lg';

const SIZES: Record<PriceTagSize, { amount: TextVariant; unit: TextVariant }> = {
  sm: { amount: 'priceSm', unit: 'caption' },
  md: { amount: 'price', unit: 'label' },
  lg: { amount: 'priceLg', unit: 'bodyStrong' },
};

const SPOKEN_CURRENCY: Record<string, string> = {
  FCFA: 'francs CFA',
};

/** "150 000" with non-breaking spaces, so the amount never splits (lot 3). */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('fr-FR').replace(/[\s ]/g, NBSP);
}

export interface PriceTagProps {
  amount: number;
  /** API `devise`; XAF is shown as FCFA, like on the website. */
  currency?: string;
  /** API period (hour, day, night, month, year) or its French label; unknown values are dropped. */
  period?: string | null;
  /** sm: cards in a row, md: listing cards (default), lg: listing detail. */
  size?: PriceTagSize;
  /** Amount colour; `link` is the amber of the website that passes AA as text. */
  color?: ColorToken;
  style?: StyleProp<ViewStyle>;
}

/**
 * Listing price as on the website: amount in bold amber, then "FCFA / mois".
 * The amount never splits, and the unit moves to the next line as one block
 * when the row is too narrow (200 % font size). TalkBack reads it as a whole.
 */
export function PriceTag({ amount, currency = 'XAF', period, size = 'md', color = 'link', style }: PriceTagProps) {
  const unit = currency === 'XAF' ? 'FCFA' : currency;
  const per = periodLabel(period);
  const v = SIZES[size];
  const amountText = formatAmount(amount);
  const unitText = per ? `${unit}${NBSP}/${NBSP}${per}` : unit;
  const spoken = `${amountText} ${SPOKEN_CURRENCY[unit] ?? unit}${per ? ` par ${per}` : ''}`;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={spoken}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: Spacing.xs }, style]}
    >
      <AppText variant={v.amount} color={color}>
        {amountText}
      </AppText>
      <AppText variant={v.unit} color="onSurface">
        {unitText}
      </AppText>
    </View>
  );
}
