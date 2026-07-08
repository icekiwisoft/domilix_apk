import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Chip, IconButton, SegmentedButtons } from 'react-native-paper';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/queries/use-categories';
import { useCreateListingStore } from '@/stores/create-listing.store';
import type { AdType, AnnounceType } from '@/types/announce';

export default function CreateStep1Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft } = useCreateListingStore();

  const categoryType = draft.type === 'realestate' ? 'house' : 'furniture';
  const { data: categoriesData } = useCategories({ type: categoryType });
  const categories = categoriesData?.data ?? [];

  function handleNext() {
    if (!draft.category_id) return;
    router.push('/announces/create/step-2');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <IconButton
          icon="close"
          size={22}
          onPress={() => router.back()}
          accessibilityLabel="Fermer"
        />
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Nouvelle annonce
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={1} />

        {/* Type de bien + Type d'annonce — même ligne */}
        <View style={styles.typeRow}>
          <View style={styles.typeCol}>
            <Text style={[Typography.labelSm, styles.typeLabel, { color: C.onSurfaceVariant }]}>
              TYPE DE BIEN
            </Text>
            <SegmentedButtons
              value={draft.type}
              onValueChange={(v) => setDraft({ type: v as AnnounceType, category_id: '' })}
              theme={{ colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } }}
              buttons={[
                { value: 'realestate', label: 'Immobilier' },
                { value: 'furniture', label: 'Mobilier' },
              ]}
            />
          </View>

          <View style={styles.typeCol}>
            <Text style={[Typography.labelSm, styles.typeLabel, { color: C.onSurfaceVariant }]}>
              TYPE D'ANNONCE
            </Text>
            <SegmentedButtons
              value={draft.ad_type}
              onValueChange={(v) => setDraft({ ad_type: v as AdType })}
              theme={{ colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } }}
              buttons={[
                { value: 'location', label: 'Location' },
                { value: 'sale', label: 'Vente' },
              ]}
            />
          </View>
        </View>

        <Text style={[Typography.headlineMd, styles.sectionTitle, { color: C.onSurface }]}>
          Catégorie
        </Text>

        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const active = draft.category_id === cat.id;
            return (
              <Chip
                key={cat.id}
                selected={active}
                showSelectedCheck={false}
                onPress={() => setDraft({ category_id: cat.id })}
                style={[
                  styles.categoryChip,
                  { backgroundColor: active ? C.primary : C.surfaceContainer },
                ]}
                textStyle={{ color: active ? C.onPrimary : C.onSurface }}
              >
                {cat.name}
              </Chip>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={!draft.category_id}
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
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  typeCol: {
    flex: 1,
    gap: Spacing.sm,
  },
  typeLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    borderRadius: Radius.md,
  },
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
