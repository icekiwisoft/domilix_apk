import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Chip, IconButton, SegmentedButtons, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFilterStore } from '@/stores/filter.store';
import type { AnnounceFilters, Standing } from '@/types/announce';

const AMENITY_OPTIONS: { key: string; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { key: 'wifi', label: 'Wifi', icon: 'wifi' },
  { key: 'pool', label: 'Piscine', icon: 'pool' },
  { key: 'air_conditioning', label: 'Climatisation', icon: 'ac-unit' },
  { key: 'security_24h', label: 'Gardiennage', icon: 'security' },
  { key: 'gate', label: 'Portail', icon: 'lock' },
  { key: 'equipped_kitchen', label: 'Cuisine équipée', icon: 'kitchen' },
];

const STANDING_OPTIONS: { value: Standing; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'confort', label: 'Confort' },
  { value: 'haut_standing', label: 'Haut standing' },
];

function SectionTitle({ children }: { children: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.12, marginBottom: Spacing.sm }]}>
      {children}
    </Text>
  );
}

export default function FilterSheetScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { filters, setFilters, clearFilters } = useFilterStore();
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };

  const [adType, setAdType] = useState<'location' | 'sale'>(filters.ad_type ?? 'location');
  const [budgetMin, setBudgetMin] = useState(filters.budget_min ? String(filters.budget_min) : '');
  const [budgetMax, setBudgetMax] = useState(filters.budget_max ? String(filters.budget_max) : '');
  const [bedroomMin, setBedroomMin] = useState(filters.bedroom_min ?? 0);
  const [amenities, setAmenities] = useState<string[]>(filters.amenities ?? []);
  const [standing, setStanding] = useState<Standing | undefined>(filters.standing);

  function toggleAmenity(key: string) {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleReset() {
    clearFilters();
    setBudgetMin('');
    setBudgetMax('');
    setBedroomMin(0);
    setAmenities([]);
    setStanding(undefined);
    setAdType('location');
  }

  function handleApply() {
    const patch: Partial<AnnounceFilters> = {
      ad_type: adType,
      budget_min: budgetMin ? Number(budgetMin.replace(/\s/g, '')) : undefined,
      budget_max: budgetMax ? Number(budgetMax.replace(/\s/g, '')) : undefined,
      bedroom_min: bedroomMin > 0 ? bedroomMin : undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      standing,
    };
    setFilters(patch);
    router.back();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.surfaceVariant }]}>
        <IconButton
          icon="refresh"
          size={20}
          onPress={handleReset}
          accessibilityLabel="Réinitialiser les filtres"
        />
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 22 }]}>Filtres</Text>
        <IconButton
          icon="close"
          size={20}
          onPress={() => router.back()}
          accessibilityLabel="Fermer"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type d'annonce */}
        <View style={styles.section}>
          <SectionTitle>Type d'annonce</SectionTitle>
          <SegmentedButtons
            value={adType}
            onValueChange={(v) => setAdType(v as 'location' | 'sale')}
            theme={segmentedTheme}
            buttons={[
              { value: 'location', label: 'Location' },
              { value: 'sale', label: 'Vente' },
            ]}
          />
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <SectionTitle>Budget (FCFA)</SectionTitle>
          <View style={styles.budgetRow}>
            <TextInput
              mode="outlined"
              label="Min"
              value={budgetMin}
              onChangeText={setBudgetMin}
              keyboardType="numeric"
              style={styles.budgetInput}
            />
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>—</Text>
            <TextInput
              mode="outlined"
              label="Max"
              value={budgetMax}
              onChangeText={setBudgetMax}
              keyboardType="numeric"
              style={styles.budgetInput}
            />
          </View>
        </View>

        {/* Chambres */}
        <View style={styles.section}>
          <SectionTitle>Chambres minimum</SectionTitle>
          <View style={styles.counterRow}>
            {[0, 1, 2, 3, 4, 5].map((n) => {
              const active = bedroomMin === n;
              return (
                <Chip
                  key={n}
                  compact
                  selected={active}
                  showSelectedCheck={false}
                  onPress={() => setBedroomMin(n)}
                  style={active ? { backgroundColor: C.primary } : { backgroundColor: C.surfaceContainer }}
                  textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                >
                  {n === 0 ? 'Tous' : `${n}+`}
                </Chip>
              );
            })}
          </View>
        </View>

        {/* Équipements */}
        <View style={styles.section}>
          <SectionTitle>Équipements</SectionTitle>
          <View style={styles.amenityGrid}>
            {AMENITY_OPTIONS.map((a) => {
              const active = amenities.includes(a.key);
              return (
                <Chip
                  key={a.key}
                  compact
                  selected={active}
                  showSelectedCheck={false}
                  icon={({ size }) => (
                    <MaterialIcons name={a.icon} size={size} color={active ? C.primary : C.onSurfaceVariant} />
                  )}
                  onPress={() => toggleAmenity(a.key)}
                  style={active ? { backgroundColor: C.primaryFixed, borderColor: C.primaryFixedDim } : { backgroundColor: C.surfaceContainer }}
                  textStyle={{ color: active ? C.primary : C.onSurface }}
                >
                  {a.label}
                </Chip>
              );
            })}
          </View>
        </View>

        {/* Standing */}
        <View style={styles.section}>
          <SectionTitle>Standing</SectionTitle>
          <SegmentedButtons
            value={standing ?? ''}
            onValueChange={(v) => setStanding(v ? (v as Standing) : undefined)}
            theme={segmentedTheme}
            buttons={STANDING_OPTIONS}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Button
          mode="contained"
          onPress={handleApply}
          contentStyle={styles.applyBtnContent}
          style={styles.applyBtn}
        >
          Appliquer les filtres
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  budgetInput: {
    flex: 1,
  },
  counterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  applyBtn: {
    borderRadius: Radius.md,
  },
  applyBtnContent: {
    height: 52,
  },
});
