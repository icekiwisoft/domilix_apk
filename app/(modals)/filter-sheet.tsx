import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
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
        <Pressable onPress={handleReset} hitSlop={8}>
          <MaterialIcons name="refresh" size={22} color={C.onSurfaceVariant} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 22 }]}>Filtres</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="close" size={22} color={C.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type d'annonce */}
        <View style={styles.section}>
          <SectionTitle>Type d'annonce</SectionTitle>
          <ToggleSwitch
            options={[{ label: 'Location', value: 'location' }, { label: 'Vente', value: 'sale' }]}
            value={adType}
            onChange={setAdType}
          />
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <SectionTitle>Budget (FCFA)</SectionTitle>
          <View style={styles.budgetRow}>
            <View style={[styles.budgetInput, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }]}>
              <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>Min</Text>
              <TextInput
                value={budgetMin}
                onChangeText={setBudgetMin}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={C.onSurfaceVariant}
                style={[Typography.bodyMd, { color: C.onSurface, flex: 1 }]}
              />
            </View>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>—</Text>
            <View style={[styles.budgetInput, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }]}>
              <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>Max</Text>
              <TextInput
                value={budgetMax}
                onChangeText={setBudgetMax}
                keyboardType="numeric"
                placeholder="∞"
                placeholderTextColor={C.onSurfaceVariant}
                style={[Typography.bodyMd, { color: C.onSurface, flex: 1 }]}
              />
            </View>
          </View>
        </View>

        {/* Chambres */}
        <View style={styles.section}>
          <SectionTitle>Chambres minimum</SectionTitle>
          <View style={styles.counterRow}>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setBedroomMin(n)}
                style={[
                  styles.counterPill,
                  {
                    backgroundColor: bedroomMin === n ? C.primary : C.surfaceContainer,
                    borderColor: bedroomMin === n ? C.primary : C.outlineVariant,
                  },
                ]}
              >
                <Text style={[Typography.labelSm, {
                  color: bedroomMin === n ? C.onPrimary : C.onSurface,
                  textTransform: 'none',
                }]}>
                  {n === 0 ? 'Tous' : `${n}+`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Équipements */}
        <View style={styles.section}>
          <SectionTitle>Équipements</SectionTitle>
          <View style={styles.amenityGrid}>
            {AMENITY_OPTIONS.map((a) => {
              const active = amenities.includes(a.key);
              return (
                <Pressable
                  key={a.key}
                  onPress={() => toggleAmenity(a.key)}
                  style={[
                    styles.amenityChip,
                    {
                      backgroundColor: active ? C.primaryFixed : C.surfaceContainer,
                      borderColor: active ? C.primaryFixedDim : C.outlineVariant,
                    },
                  ]}
                >
                  <MaterialIcons name={a.icon} size={16} color={active ? C.primary : C.onSurfaceVariant} />
                  <Text style={[Typography.caption, {
                    color: active ? C.primary : C.onSurface,
                    fontFamily: 'PlusJakartaSans_500Medium',
                  }]}>
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Standing */}
        <View style={styles.section}>
          <SectionTitle>Standing</SectionTitle>
          <View style={styles.standingRow}>
            {STANDING_OPTIONS.map((s) => {
              const active = standing === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setStanding(active ? undefined : s.value)}
                  style={[
                    styles.standingBtn,
                    {
                      backgroundColor: active ? C.primary : C.surfaceContainer,
                      borderColor: active ? C.primary : C.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[Typography.labelSm, {
                    color: active ? C.onPrimary : C.onSurface,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable
          onPress={handleApply}
          style={[styles.applyBtn, { backgroundColor: C.primary }]}
        >
          <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
            Appliquer les filtres
          </Text>
        </Pressable>
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
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 48,
  },
  counterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  counterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    minWidth: 48,
    alignItems: 'center',
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  standingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  standingBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  applyBtn: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
