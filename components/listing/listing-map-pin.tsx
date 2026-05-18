import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ListingMapPinProps {
  price: number;
  devise: string;
  selected?: boolean;
}

function formatShort(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}Md`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}k`;
  return String(price);
}

export function ListingMapPin({ price, devise, selected = false }: ListingMapPinProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const currency = devise === 'XAF' ? 'FCFA' : devise;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.pin,
          {
            backgroundColor: selected ? C.primary : C.surface,
            borderColor: selected ? C.primary : C.outlineVariant,
          },
        ]}
      >
        <Text
          style={[
            Typography.caption,
            styles.label,
            { color: selected ? C.onPrimary : C.primary, fontFamily: 'PlusJakartaSans_700Bold' },
          ]}
        >
          {formatShort(price)} {currency}
        </Text>
      </View>
      {/* Tail */}
      <View
        style={[
          styles.tail,
          { borderTopColor: selected ? C.primary : C.outlineVariant },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  pin: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
