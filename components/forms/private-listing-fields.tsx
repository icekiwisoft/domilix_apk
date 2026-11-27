import { Switch, View } from 'react-native';
import { AppText, Field } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import type { PrivateListingInfo } from '@/services/ad-activity.service';

export function PrivateListingFields({ value, onChange }: {
  value: PrivateListingInfo;
  onChange: (patch: Partial<PrivateListingInfo>) => void;
}) {
  return (
    <View style={{ gap: Spacing.ms }}>
      <AppText variant="bodyStrong" accessibilityRole="header">Informations privées</AppText>
      <AppText variant="bodySm" color="onSurfaceVariant">
        Visibles uniquement par vous. Elles ne sont pas transmises aux acheteurs, même après déblocage.
      </AppText>
      <Field label="Nom du propriétaire ou bailleur" labelHint="(facultatif)"
        value={value.owner_name} maxLength={255} onChangeText={(owner_name) => onChange({ owner_name })} />
      <Field label="Téléphone privé" labelHint="(facultatif)" keyboardType="phone-pad"
        value={value.owner_phone} maxLength={64} onChangeText={(owner_phone) => onChange({ owner_phone })} />
      <Field label="Notes privées" labelHint="(facultatif)" multiline numberOfLines={3}
        value={value.notes} maxLength={4000} onChangeText={(notes) => onChange({ notes })} />
    </View>
  );
}

export function DomilixSaleToggle({ value, onChange }: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const C = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.ms }}>
      <View style={{ flex: 1, gap: Spacing.xs }}>
        <AppText variant="bodyStrong">Paiement via Domilix</AppText>
        <AppText variant="bodySm" color="onSurfaceVariant">
          Ce bien pourra être ajouté au panier. L’encaissement n’est pas encore disponible.
        </AppText>
      </View>
      <Switch accessibilityLabel="Paiement via Domilix" value={value} onValueChange={onChange}
        trackColor={{ true: C.primary }} />
    </View>
  );
}
