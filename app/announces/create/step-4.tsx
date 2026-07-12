import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Chip, SegmentedButtons } from 'react-native-paper';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore } from '@/stores/create-listing.store';
import type { Standing } from '@/types/announce';

const STANDING_OPTIONS: { value: Standing; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'confort', label: 'Confort' },
  { value: 'haut_standing', label: 'Haut standing' },
];

const AMENITY_OPTIONS = [
  { key: 'wifi' as const, label: 'Wifi', icon: 'wifi' as const },
  { key: 'pool' as const, label: 'Piscine', icon: 'pool' as const },
  { key: 'air_conditioning' as const, label: 'Clim', icon: 'ac-unit' as const },
  { key: 'security_24h' as const, label: 'Gardiennage', icon: 'security' as const },
  { key: 'gate' as const, label: 'Portail', icon: 'lock' as const },
  { key: 'equipped_kitchen' as const, label: 'Cuisine éq.', icon: 'kitchen' as const },
  { key: 'smart_tv' as const, label: 'Smart TV', icon: 'tv' as const },
];

function SectionLabel({ children }: { children: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.12, marginBottom: Spacing.sm }]}>
      {children}
    </Text>
  );
}

export default function CreateStep4Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft } = useCreateListingStore();
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={4} total={5} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
          Équipements
        </Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs, marginBottom: Spacing.xl }]}>
          Sélectionnez les équipements disponibles dans votre bien.
        </Text>

        {/* Chambres */}
        <View style={styles.section}>
          <SectionLabel>Chambres</SectionLabel>
          <View style={styles.counterRow}>
            {[0, 1, 2, 3, 4, 5].map((n) => {
              const active = draft.bedrooms === n;
              return (
                <Chip
                  key={n}
                  compact
                  selected={active}
                  showSelectedCheck={false}
                  onPress={() => setDraft({ bedrooms: n })}
                  style={{ backgroundColor: active ? C.primary : C.surfaceContainer }}
                  textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                >
                  {n === 0 ? 'Studio' : `${n}`}
                </Chip>
              );
            })}
          </View>
        </View>

        {/* Standing */}
        <View style={[styles.section, { marginTop: Spacing.xl }]}>
          <SectionLabel>Standing</SectionLabel>
          <SegmentedButtons
            value={draft.standing ?? ''}
            onValueChange={(v) => setDraft({ standing: v as Standing })}
            theme={segmentedTheme}
            buttons={STANDING_OPTIONS}
          />
        </View>

        {/* Amenities */}
        <View style={[styles.section, { marginTop: Spacing.xl }]}>
          <SectionLabel>Équipements</SectionLabel>
          <View style={styles.amenityGrid}>
            {AMENITY_OPTIONS.map((a) => {
              const active = draft[a.key];
              return (
                <Chip
                  key={a.key}
                  compact
                  selected={active}
                  showSelectedCheck={false}
                  icon={({ size }) => (
                    <MaterialIcons name={a.icon} size={size} color={active ? C.primary : C.onSurfaceVariant} />
                  )}
                  onPress={() => setDraft({ [a.key]: !active })}
                  style={active ? { backgroundColor: C.primaryFixed, borderColor: C.primaryFixedDim } : { backgroundColor: C.surfaceContainer }}
                  textStyle={{ color: active ? C.primary : C.onSurface }}
                >
                  {a.label}
                </Chip>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Button
          mode="contained"
          onPress={() => router.push('/announces/create/step-5')}
          icon="arrow-right"
          contentStyle={styles.nextBtnContent}
          style={styles.nextBtn}
        >
          Suivant — Photos
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  section: {},
  counterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  nextBtn: {
    borderRadius: Radius.md,
  },
  nextBtnContent: {
    height: 52,
    flexDirection: 'row-reverse',
  },
});
