import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AmenityPicker, StandingPicker } from '@/components/forms/listing-features';
import { MAX_ROOMS } from '@/components/forms/listing-options';
import { CREATE_STEPS, CREATE_TITLE, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { AppText, Banner, Chip, ChipGroup, Field, Screen, SegmentedControl, StepHeader, Stepper } from '@/components/ui';
import { LAND_UNLOCK_COST, LAND_USE_OPTIONS } from '@/constants/listing';
import { Spacing } from '@/constants/theme';
import { decimalOnly, digitsOnly } from '@/lib/digits';
import { useCreateListingStore } from '@/stores/create-listing.store';

const CONDITION_OPTIONS = [
  { value: 'used' as const, label: 'Occasion' },
  { value: 'new' as const, label: 'Neuf' },
];

const DIMENSION_FIELDS = [
  { key: 'height', label: 'Hauteur' },
  { key: 'width', label: 'Largeur' },
  { key: 'length', label: 'Longueur' },
  { key: 'weight', label: 'Poids' },
] as const;

const TITLES = {
  realestate: { title: 'Caractéristiques', description: 'Décrivez les pièces, le standing et les commodités du bien.' },
  land: { title: 'Caractéristiques du terrain', description: 'Indiquez la surface totale du terrain en mètres carrés.' },
  furniture: {
    title: 'Dimensions mobilier',
    description: 'Ces informations sont optionnelles et aident les visiteurs à mieux évaluer le mobilier.',
  },
} as const;

function Heading({ children }: { children: string }) {
  return (
    <AppText variant="bodyStrong" accessibilityRole="header">
      {children}
    </AppText>
  );
}

export default function CreateStep2Screen() {
  const router = useRouter();
  const { draft, setDraft, toggleAmenity } = useCreateListingStore();
  const { type } = draft;

  const canContinue = type !== 'land' || Number(draft.size) > 0;
  const heading = TITLES[type];

  return (
    <Screen
      keyboard
      header={<StepHeader title={CREATE_TITLE} step={2} total={CREATE_STEPS} onBack={() => router.back()} />}
      footer={
        <StepFooter
          onPrevious={() => router.back()}
          onNext={() => router.push('/announces/create/step-3')}
          disabled={!canContinue}
          hint="Indiquez la surface du terrain pour continuer."
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro title={heading.title} description={heading.description} />

      {type === 'realestate' ? (
        <>
          <View style={{ gap: Spacing.sm }}>
            <Stepper
              label="Chambres"
              helper="0 pour un studio"
              value={draft.bedroom}
              onChange={(bedroom) => setDraft({ bedroom })}
              min={0}
              max={MAX_ROOMS}
            />
            <Stepper
              label="Salons"
              value={draft.mainroom}
              onChange={(mainroom) => setDraft({ mainroom })}
              min={0}
              max={MAX_ROOMS}
            />
            <Stepper
              label="Toilettes"
              value={draft.toilet}
              onChange={(toilet) => setDraft({ toilet })}
              min={0}
              max={MAX_ROOMS}
            />
            <Stepper
              label="Cuisines"
              value={draft.kitchen}
              onChange={(kitchen) => setDraft({ kitchen })}
              min={0}
              max={MAX_ROOMS}
            />
          </View>
          <Field
            label="Surface"
            labelHint="(facultatif)"
            placeholder="Ex. 120"
            value={draft.size}
            onChangeText={(t) => setDraft({ size: digitsOnly(t) })}
            keyboardType="number-pad"
            suffix="m²"
            returnKeyType="done"
          />
          <StandingPicker value={draft.standing} onChange={(standing) => setDraft({ standing })} />
          <AmenityPicker value={draft.amenities} onToggle={toggleAmenity} />
        </>
      ) : null}

      {type === 'land' ? (
        <>
          <Field
            label="Surface"
            placeholder="Ex. 500"
            value={draft.size}
            onChangeText={(t) => setDraft({ size: digitsOnly(t) })}
            keyboardType="number-pad"
            suffix="m²"
            returnKeyType="done"
          />
          <View style={{ gap: Spacing.sm }}>
            <Heading>Usage</Heading>
            <ChipGroup
              label="Usage"
              options={LAND_USE_OPTIONS}
              value={draft.land_use}
              onChange={(land_use) => setDraft({ land_use })}
            />
          </View>
          <View style={{ gap: Spacing.sm }}>
            <Heading>Commodités</Heading>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              <Chip
                label="Titre foncier"
                icon="verified-user"
                selected={draft.land_title}
                onPress={() => setDraft({ land_title: !draft.land_title })}
              />
              {/* For land, the "gate" amenity stands for "Clôturé" (website form). */}
              <Chip label="Clôturé" icon="lock" selected={draft.amenities.gate} onPress={() => toggleAmenity('gate')} />
            </View>
          </View>
          <Banner icon="toll">{`Le déblocage d'un terrain coûte ${LAND_UNLOCK_COST} Domicoins.`}</Banner>
        </>
      ) : null}

      {type === 'furniture' ? (
        <>
          <View style={{ gap: Spacing.sm }}>
            <Heading>État</Heading>
            <SegmentedControl
              label="État"
              options={CONDITION_OPTIONS}
              value={draft.condition}
              onChange={(condition) => setDraft({ condition })}
            />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
            {DIMENSION_FIELDS.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                labelHint="(facultatif)"
                value={draft[field.key]}
                onChangeText={(t) => setDraft({ [field.key]: decimalOnly(t) })}
                keyboardType="decimal-pad"
                containerStyle={{ flexGrow: 1, flexBasis: '40%' }}
              />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
