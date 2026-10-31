import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Card, type IconName } from '@/components/ui';
import { Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import type { AdType, AnnounceType } from '@/types/announce';

import { deviseLabel, TYPE_LABELS } from './listing-options';

export interface ListingRecapProps {
  type: AnnounceType;
  adType: AdType;
  /** "3 photos", "3 photos (2 existantes + 1 nouvelle)". */
  photos: string;
  price: string;
  devise: string;
  /** "mois", "nuit": rentals only. */
  period?: string;
  address: string;
  city: string;
}

function Row({ icon, children }: { icon: IconName; children: string }) {
  const C = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm }}>
      <View importantForAccessibility="no-hide-descendants" style={{ paddingTop: Spacing.xs }}>
        <MaterialIcons name={icon} size={Sizes.iconSm} color={C.link} />
      </View>
      <AppText style={{ flex: 1 }}>{children}</AppText>
    </View>
  );
}

/** "Récapitulatif" card at the end of the create flow and of the edit screen. */
export function ListingRecap({ type, adType, photos, price, devise, period, address, city }: ListingRecapProps) {
  return (
    <Card surface="surfaceContainerLow" outlined style={{ gap: Spacing.xs }}>
      <AppText variant="bodyStrong" accessibilityRole="header">
        Récapitulatif
      </AppText>
      <Row icon={TYPE_LABELS[type].icon}>
        {`${TYPE_LABELS[type].label} · ${adType === 'location' ? 'Location' : 'Vente'}`}
      </Row>
      <Row icon="photo-library">{photos}</Row>
      {price ? (
        <Row icon="payments">{`${Number(price).toLocaleString('fr-FR')} ${deviseLabel(devise)}${period ? ` / ${period}` : ''}`}</Row>
      ) : null}
      {address || city ? <Row icon="place">{[address, city].filter(Boolean).join(', ')}</Row> : null}
    </Card>
  );
}
