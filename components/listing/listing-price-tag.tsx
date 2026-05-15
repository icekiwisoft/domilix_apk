import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PERIOD_LABELS: Record<string, string> = {
  month: 'mois',
  year: 'an',
  day: 'jour',
  week: 'sem.',
};

function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

interface ListingPriceTagProps {
  price: number;
  devise: string;
  period?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ListingPriceTag({ price, devise, period, size = 'md' }: ListingPriceTagProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const currency = devise === 'XAF' ? 'FCFA' : devise;
  const periodLabel = period ? PERIOD_LABELS[period] : null;

  const priceStyle =
    size === 'sm'
      ? [Typography.bodyMd, styles.bold]
      : size === 'lg'
      ? [Typography.headlineMd, styles.bold]
      : [Typography.bodyLg, styles.bold];

  return (
    <View style={styles.row}>
      <Text style={[...priceStyle, { color: C.primaryFixedDim }]} numberOfLines={1}>
        {formatPrice(price)}{' '}{currency}
      </Text>
      {periodLabel && (
        <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
          /{periodLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    flexShrink: 1,
  },
  bold: {
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
