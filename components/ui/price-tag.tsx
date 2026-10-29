import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing, type ColorToken } from '@/constants/theme';

import { AppText } from './app-text';

const NBSP = ' ';

const PERIODS: Record<string, string> = {
  day: 'jour',
  week: 'semaine',
  month: 'mois',
  year: 'an',
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
  /** API period (day, week, month, year) or a ready French label. */
  period?: string;
  /** Amount colour; `link` is the amber of the website that passes AA as text. */
  color?: ColorToken;
  style?: StyleProp<ViewStyle>;
}

/**
 * Listing price as on the website: amount in bold amber, then "FCFA / mois".
 * The amount never splits, and the unit moves to the next line as one block
 * when the row is too narrow (200 % font size). TalkBack reads it as a whole.
 */
export function PriceTag({ amount, currency = 'XAF', period, color = 'link', style }: PriceTagProps) {
  const unit = currency === 'XAF' ? 'FCFA' : currency;
  const periodLabel = period ? (PERIODS[period] ?? period) : null;
  const amountText = formatAmount(amount);
  const unitText = periodLabel ? `${unit}${NBSP}/${NBSP}${periodLabel}` : unit;
  const spoken = `${amountText} ${SPOKEN_CURRENCY[unit] ?? unit}${periodLabel ? ` par ${periodLabel}` : ''}`;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={spoken}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: Spacing.xs }, style]}
    >
      <AppText variant="price" color={color}>
        {amountText}
      </AppText>
      <AppText variant="label" color="onSurface">
        {unitText}
      </AppText>
    </View>
  );
}
