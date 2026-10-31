import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { AMENITY_OPTIONS, LAND_USE_OPTIONS, STANDING_OPTIONS } from '@/components/search/active-filters';
import {
  AppText,
  Button,
  Chip,
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
import type { AdType, AnnounceType, LandUse, Standing } from '@/types/announce';

const TYPE_OPTIONS = [
  { value: 'realestate' as const, label: 'Immobilier' },
  { value: 'furniture' as const, label: 'Mobilier' },
  { value: 'land' as const, label: 'Terrain' },
];

// "Tout" (no ad_type) first and by default, as on the website's search.
const AD_TYPE_OPTIONS = [
  { value: 'all' as const, label: 'Tout' },
  { value: 'location' as const, label: 'À louer' },
  { value: 'sale' as const, label: 'À vendre' },
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
  const [adType, setAdType] = useState<AdType | 'all'>(filters.ad_type ?? 'all');
  const [budgetMin, setBudgetMin] = useState(filters.budget_min ? String(filters.budget_min) : '');
  const [budgetMax, setBudgetMax] = useState(filters.budget_max ? String(filters.budget_max) : '');
  const [bedroomMin, setBedroomMin] = useState(filters.bedroom_min ?? 0);
  const [amenities, setAmenities] = useState<string[]>(filters.amenities ?? []);
  const [standing, setStanding] = useState<Standing | undefined>(filters.standing);
  const [sizeMin, setSizeMin] = useState(filters.size_min ? String(filters.size_min) : '');
  const [sizeMax, setSizeMax] = useState(filters.size_max ? String(filters.size_max) : '');
  const [landUse, setLandUse] = useState<LandUse | undefined>(filters.land_use);
  const [landTitle, setLandTitle] = useState(!!filters.land_title);
  const isLand = type === 'land';

  function handleReset() {
    // Reset the sheet's criteria and those a home row's "Tout voir" sets (recommended,
    // period), which the sheet does not show. The city and the search text stay (UI-07).
    setFilters({
      type: undefined,
      ad_type: undefined,
      recommended: undefined,
      period: undefined,
      budget_min: undefined,
      budget_max: undefined,
      bedroom_min: undefined,
      amenities: undefined,
      standing: undefined,
      size_min: undefined,
      size_max: undefined,
      land_use: undefined,
      land_title: undefined,
    });
    setType('realestate');
    setAdType('all');
    setBudgetMin('');
    setBudgetMax('');
    setBedroomMin(0);
    setAmenities([]);
    setStanding(undefined);
    setSizeMin('');
    setSizeMax('');
    setLandUse(undefined);
    setLandTitle(false);
  }

  function handleApply() {
    const patch: Partial<ExploreFilters> = {
      // Defaults (Immobilier, Tout) are stored as "not set": they are not active filters.
      type: type === 'realestate' ? undefined : type,
      ad_type: adType === 'all' ? undefined : adType,
      budget_min: parseAmount(budgetMin),
      budget_max: parseAmount(budgetMax),
      // Rooms, standing and amenities do not apply to land; size, use and title only to land.
      bedroom_min: !isLand && bedroomMin > 0 ? bedroomMin : undefined,
      amenities: !isLand && amenities.length > 0 ? amenities : undefined,
      standing: isLand ? undefined : standing,
      size_min: isLand ? parseAmount(sizeMin) : undefined,
      size_max: isLand ? parseAmount(sizeMax) : undefined,
      land_use: isLand ? landUse : undefined,
      land_title: isLand && landTitle ? true : undefined,
    };
    // A rental period ("À la nuit" from the home row) never matches a sale: drop it
    // rather than show a list that is always empty.
    if (adType === 'sale') patch.period = undefined;
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

      {isLand ? (
        <Section title="Surface du terrain">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
            <Field
              label="Minimum"
              value={sizeMin}
              onChangeText={setSizeMin}
              placeholder="0"
              keyboardType="number-pad"
              suffix="m²"
              containerStyle={budgetField}
            />
            <Field
              label="Maximum"
              value={sizeMax}
              onChangeText={setSizeMax}
              placeholder="Sans limite"
              keyboardType="number-pad"
              suffix="m²"
              containerStyle={budgetField}
            />
          </View>
        </Section>
      ) : null}

      {isLand ? (
        <Section title="Usage">
          <ChipGroup
            label="Usage"
            options={LAND_USE_OPTIONS}
            value={landUse ?? null}
            onChange={(v) => setLandUse(v === landUse ? undefined : v)}
          />
          <View style={{ flexDirection: 'row' }}>
            <Chip
              label="Titre foncier"
              icon="verified-user"
              selected={landTitle}
              onPress={() => setLandTitle((v) => !v)}
            />
          </View>
        </Section>
      ) : null}

      {isLand ? null : (
      <>
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
      </>
      )}
    </Screen>
  );
}
