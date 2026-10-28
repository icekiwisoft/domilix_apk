import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import {
  ChoiceChip,
  NumberField,
  SectionLabel,
  StepTitle,
  WizardFooter,
  wizardStyles,
} from '@/components/forms/create-step-parts';
import { AMENITY_OPTIONS, LAND_UNLOCK_COST, LAND_USE_OPTIONS, STANDING_OPTIONS } from '@/constants/listing';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore, type CreateListingDraft } from '@/stores/create-listing.store';

const CONDITION_OPTIONS = [
  { value: 'used', label: 'Occasion' },
  { value: 'new', label: 'Neuf' },
] as const;

const DIMENSION_FIELDS = [
  { key: 'height', label: 'Hauteur' },
  { key: 'width', label: 'Largeur' },
  { key: 'length', label: 'Longueur' },
  { key: 'weight', label: 'Poids' },
] as const;

const TITLES = {
  realestate: { title: 'Caractéristiques', subtitle: 'Décrivez les pièces, le standing et les commodités du bien.' },
  land: { title: 'Caractéristiques du terrain', subtitle: 'Indiquez la surface totale du terrain en mètres carrés.' },
  furniture: { title: 'Dimensions mobilier', subtitle: 'Ces informations sont optionnelles et aident les visiteurs à mieux évaluer le mobilier.' },
} as const;

function decimal(text: string) {
  return text.replace(',', '.').replace(/[^0-9.]/g, '');
}

export default function CreateStep2Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft, toggleAmenity } = useCreateListingStore();
  const { type } = draft;

  const canContinue = type !== 'land' || Number(draft.size) > 0;
  const heading = TITLES[type];

  return (
    <SafeAreaView style={[wizardStyles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={2} total={4} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={wizardStyles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepTitle title={heading.title} subtitle={heading.subtitle} />

        {type === 'realestate' && (
          <>
            <View style={wizardStyles.row}>
              <NumberField label="Chambres" value={draft.bedroom} onChange={(bedroom) => setDraft({ bedroom })} />
              <TextInput
                mode="outlined"
                label="Taille (m²)"
                placeholder="m²"
                value={draft.size}
                onChangeText={(t) => setDraft({ size: decimal(t) })}
                keyboardType="decimal-pad"
                style={styles.flex}
              />
            </View>
            <View style={wizardStyles.row}>
              <NumberField label="Salons" value={draft.mainroom} onChange={(mainroom) => setDraft({ mainroom })} />
              <NumberField label="Toilettes" value={draft.toilet} onChange={(toilet) => setDraft({ toilet })} />
              <NumberField label="Cuisines" value={draft.kitchen} onChange={(kitchen) => setDraft({ kitchen })} />
            </View>

            <View>
              <SectionLabel>Standing</SectionLabel>
              <View style={wizardStyles.wrap}>
                {STANDING_OPTIONS.map((opt) => (
                  <ChoiceChip
                    key={opt.value}
                    label={opt.label}
                    active={draft.standing === opt.value}
                    onPress={() => setDraft({ standing: opt.value })}
                  />
                ))}
              </View>
            </View>

            <View>
              <SectionLabel>Commodités</SectionLabel>
              <View style={wizardStyles.wrap}>
                {AMENITY_OPTIONS.map((amenity) => (
                  <ChoiceChip
                    key={amenity.key}
                    label={amenity.label}
                    icon={amenity.icon}
                    active={draft.amenities[amenity.key]}
                    onPress={() => toggleAmenity(amenity.key)}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.recap, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
              <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                Récapitulatif
              </Text>
              <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
                Immobilier · {draft.ad_type === 'location' ? 'Location' : 'Vente'}
              </Text>
              <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
                {draft.bedroom === 0 ? 'Studio' : `${draft.bedroom} chambre${draft.bedroom > 1 ? 's' : ''}`}
              </Text>
            </View>
          </>
        )}

        {type === 'land' && (
          <>
            <TextInput
              mode="outlined"
              label="Surface (m²) *"
              placeholder="Ex: 500"
              value={draft.size}
              onChangeText={(t) => setDraft({ size: decimal(t) })}
              keyboardType="decimal-pad"
            />

            <View>
              <SectionLabel>Usage</SectionLabel>
              <View style={wizardStyles.wrap}>
                {LAND_USE_OPTIONS.map((opt) => (
                  <ChoiceChip
                    key={opt.value}
                    label={opt.label}
                    active={draft.land_use === opt.value}
                    onPress={() => setDraft({ land_use: opt.value })}
                  />
                ))}
              </View>
            </View>

            <View>
              <SectionLabel>Commodités</SectionLabel>
              <View style={wizardStyles.wrap}>
                <ChoiceChip
                  label="Titre foncier"
                  icon="verified-user"
                  active={draft.land_title}
                  onPress={() => setDraft({ land_title: !draft.land_title })}
                />
                <ChoiceChip
                  label="Clôturé"
                  icon="lock"
                  active={draft.amenities.gate}
                  onPress={() => toggleAmenity('gate')}
                />
              </View>
            </View>

            <View style={[styles.notice, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
              <MaterialIcons name="toll" size={18} color={C.primary} />
              <Text style={[Typography.caption, { color: C.onSurface, flex: 1, lineHeight: 18 }]}>
                {`Le déblocage d'un terrain coûte ${LAND_UNLOCK_COST} Domicoins.`}
              </Text>
            </View>
          </>
        )}

        {type === 'furniture' && (
          <>
            <View>
              <SectionLabel>État</SectionLabel>
              <View style={wizardStyles.wrap}>
                {CONDITION_OPTIONS.map((opt) => (
                  <ChoiceChip
                    key={opt.value}
                    label={opt.label}
                    active={draft.condition === opt.value}
                    onPress={() => setDraft({ condition: opt.value })}
                  />
                ))}
              </View>
            </View>

            <View style={styles.dimensions}>
              {DIMENSION_FIELDS.map((field) => (
                <TextInput
                  key={field.key}
                  mode="outlined"
                  label={field.label}
                  value={draft[field.key as keyof CreateListingDraft] as string}
                  onChangeText={(t) => setDraft({ [field.key]: decimal(t) })}
                  keyboardType="decimal-pad"
                  style={styles.dimension}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <WizardFooter
        label="Suivant"
        disabled={!canContinue}
        onPress={() => router.push('/announces/create/step-3')}
        error={canContinue ? undefined : 'Veuillez indiquer la surface du terrain.'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dimensions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dimension: { width: '48%' },
  recap: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});
