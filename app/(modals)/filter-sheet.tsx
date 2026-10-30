import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { AMENITY_OPTIONS, STANDING_OPTIONS } from '@/components/search/active-filters';
import {
  AppText,
  Button,
  ChipGroup,
  Field,
  IconButton,
  Screen,
  ScreenHeader,
  SegmentedControl,
} from '@/components/ui';
import { Borders, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useFilterStore, type ExploreFilters } from '@/stores/filter.store';
import type { AdType, AnnounceType, Standing } from '@/types/announce';

const TYPE_OPTIONS = [
  { value: 'realestate' as const, label: 'Immobilier' },
  { value: 'furniture' as const, label: 'Mobilier' },
];

const AD_TYPE_OPTIONS = [
  { value: 'location' as const, label: 'À louer' },
  { value: 'sale' as const, label: 'À vendre' },
  // Set by the home rows "Nos recommandations" and "Dernières annonces" (UI-11).
  { value: 'all' as const, label: 'Tout' },
];

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5].map((n) => ({
  value: n,
  label: n === 0 ? 'Toutes' : `${n}+`,
}));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.ms }}>
      <AppText variant="bodyStrong" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

/** Digits only ("150 000" typed or pasted becomes 150000); empty means no bound. */
function parseAmount(text: string): number | undefined {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : undefined;
}

export default function FilterSheetScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const { filters, setFilters } = useFilterStore();
  // Side by side the two budget fields cut "Sans limite" from 150 % font size: stack them.
  const { fontScale } = useWindowDimensions();
  const budgetField = { flexGrow: 1, flexBasis: fontScale >= 1.5 ? ('100%' as const) : 0 };

  const [type, setType] = useState<AnnounceType>(filters.type ?? 'realestate');
  const [adType, setAdType] = useState<AdType | 'all'>(filters.ad_type ?? 'location');
  const [budgetMin, setBudgetMin] = useState(filters.budget_min ? String(filters.budget_min) : '');
  const [budgetMax, setBudgetMax] = useState(filters.budget_max ? String(filters.budget_max) : '');
  const [bedroomMin, setBedroomMin] = useState(filters.bedroom_min ?? 0);
  const [amenities, setAmenities] = useState<string[]>(filters.amenities ?? []);
  const [standing, setStanding] = useState<Standing | undefined>(filters.standing);

  function handleReset() {
    // Reset only the criteria shown in this sheet: the city (chosen from home) and the
    // search text are not in the sheet, so they stay.
    setFilters({
      type: undefined,
      ad_type: undefined,
      budget_min: undefined,
      budget_max: undefined,
      bedroom_min: undefined,
      amenities: undefined,
      standing: undefined,
    });
    setType('realestate');
    setAdType('location');
    setBudgetMin('');
    setBudgetMax('');
    setBedroomMin(0);
    setAmenities([]);
    setStanding(undefined);
  }

  function handleApply() {
    const patch: Partial<ExploreFilters> = {
      // Defaults (Immobilier, À louer) are stored as "not set": they are not active filters.
      type: type === 'realestate' ? undefined : type,
      ad_type: adType === 'location' ? undefined : adType,
      budget_min: parseAmount(budgetMin),
      budget_max: parseAmount(budgetMax),
      bedroom_min: bedroomMin > 0 ? bedroomMin : undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      standing,
    };
    setFilters(patch);
    router.back();
  }

  return (
    <Screen
      keyboard
      background="surface"
      header={
        <ScreenHeader
          title="Filtres"
          onBack={false}
          actions={<IconButton icon="close" label="Fermer" onPress={() => router.back()} />}
        />
      }
      footer={
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.ms,
            paddingHorizontal: Spacing.marginMobile,
            paddingTop: Spacing.ms,
            paddingBottom: Spacing.ms,
            borderTopWidth: Borders.thin,
            borderTopColor: C.outlineVariant,
          }}
        >
          <Button label="Réinitialiser" variant="secondary" size="lg" onPress={handleReset} />
          <Button label="Afficher les résultats" size="lg" onPress={handleApply} style={{ flexGrow: 1 }} />
        </View>
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <Section title="Catégorie">
        <SegmentedControl label="Catégorie" options={TYPE_OPTIONS} value={type} onChange={setType} />
      </Section>

      <Section title="Type d'annonce">
        <SegmentedControl label="Type d'annonce" options={AD_TYPE_OPTIONS} value={adType} onChange={setAdType} />
      </Section>

      <Section title="Budget">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
          <Field
            label="Minimum"
            value={budgetMin}
            onChangeText={setBudgetMin}
            placeholder="0"
            keyboardType="number-pad"
            suffix="FCFA"
            containerStyle={budgetField}
          />
          <Field
            label="Maximum"
            value={budgetMax}
            onChangeText={setBudgetMax}
            placeholder="Sans limite"
            keyboardType="number-pad"
            suffix="FCFA"
            containerStyle={budgetField}
          />
        </View>
      </Section>

      <Section title="Chambres minimum">
        <ChipGroup label="Chambres minimum" options={BEDROOM_OPTIONS} value={bedroomMin} onChange={setBedroomMin} />
      </Section>

      <Section title="Équipements">
        <ChipGroup label="Équipements" multiple options={AMENITY_OPTIONS} value={amenities} onChange={setAmenities} />
      </Section>

      <Section title="Standing">
        <ChipGroup
          label="Standing"
          options={STANDING_OPTIONS}
          value={standing ?? null}
          // Touching the selected standing again clears it.
          onChange={(v) => setStanding(v === standing ? undefined : v)}
        />
      </Section>
    </Screen>
  );
}
