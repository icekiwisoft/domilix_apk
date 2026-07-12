import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Chip, SegmentedButtons, TextInput } from 'react-native-paper';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/queries/use-categories';
import { useCreateListingStore } from '@/stores/create-listing.store';

const DEVISES = ['FCFA', 'EUR', 'USD'];

export default function CreateStep2Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft } = useCreateListingStore();
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };
  const total = draft.type === 'furniture' ? 4 : 5;

  const categoryType = draft.type === 'realestate' ? 'house' : 'furniture';
  const { data: categoriesData } = useCategories({ type: categoryType });
  const categories = categoriesData?.data ?? [];

  const canContinue = !!draft.category_id && !!draft.price;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={2} total={total} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
          Catégorie & Prix
        </Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs, marginBottom: Spacing.xl }]}>
          Précisez la catégorie et le prix de votre bien.
        </Text>

        <Text style={[Typography.labelSm, styles.sectionLabel, { color: C.onSurfaceVariant }]}>CATÉGORIE</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const active = draft.category_id === cat.id;
            return (
              <Chip
                key={cat.id}
                selected={active}
                showSelectedCheck={false}
                onPress={() => setDraft({ category_id: cat.id })}
                style={{ backgroundColor: active ? C.primary : C.surfaceContainer }}
                textStyle={{ color: active ? C.onPrimary : C.onSurface }}
              >
                {cat.name}
              </Chip>
            );
          })}
        </View>

        <View style={[styles.section, { marginTop: Spacing.xl }]}>
          <TextInput
            mode="outlined"
            label={`Prix${draft.ad_type === 'location' ? ' (par mois)' : ''}`}
            value={draft.price}
            onChangeText={(t) => setDraft({ price: t })}
            keyboardType="numeric"
          />
          <SegmentedButtons
            style={styles.deviseSelector}
            value={draft.devise}
            onValueChange={(v) => setDraft({ devise: v })}
            theme={segmentedTheme}
            buttons={DEVISES.map((d) => ({ value: d, label: d }))}
          />
        </View>

        {draft.type === 'realestate' && (
          <View style={[styles.section, { marginTop: Spacing.lg }]}>
            <TextInput
              mode="outlined"
              label="Surface (m²) — optionnel"
              value={draft.size}
              onChangeText={(t) => setDraft({ size: t })}
              keyboardType="numeric"
            />
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Button
          mode="contained"
          onPress={() => router.push('/announces/create/step-3')}
          disabled={!canContinue}
          icon="arrow-right"
          contentStyle={styles.nextBtnContent}
          style={styles.nextBtn}
        >
          Suivant
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
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  section: {},
  deviseSelector: {
    marginTop: Spacing.sm,
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
