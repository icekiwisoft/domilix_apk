import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/queries/use-categories';
import { useCreateListingStore } from '@/stores/create-listing.store';
import type { AdType, AnnounceType } from '@/types/announce';

function StepIndicator({ current, total }: { current: number; total: number }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            {
              backgroundColor: i < current ? C.primary : i === current - 1 ? C.primary : C.outlineVariant,
              flex: 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

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
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="close" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Nouvelle annonce
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={1} total={3} />

        <Text style={[Typography.headlineMd, styles.sectionTitle, { color: C.onSurface }]}>
          Type de bien
        </Text>

        <ToggleSwitch
          options={[
            { label: 'Immobilier', value: 'realestate' },
            { label: 'Mobilier', value: 'furniture' },
          ]}
          value={draft.type}
          onChange={(v: AnnounceType) => setDraft({ type: v, category_id: '' })}
        />

        <Text style={[Typography.headlineMd, styles.sectionTitle, { color: C.onSurface, marginTop: Spacing.xl }]}>
          Type d'annonce
        </Text>

        <ToggleSwitch
          options={[
            { label: 'Location', value: 'location' },
            { label: 'Vente', value: 'sale' },
          ]}
          value={draft.ad_type}
          onChange={(v: AdType) => setDraft({ ad_type: v })}
        />

        <Text style={[Typography.headlineMd, styles.sectionTitle, { color: C.onSurface, marginTop: Spacing.xl }]}>
          Catégorie
        </Text>

        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const active = draft.category_id === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setDraft({ category_id: cat.id })}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? C.primary : C.surfaceContainer,
                    borderColor: active ? C.primary : C.outlineVariant,
                  },
                ]}
              >
                <Text style={[
                  Typography.bodyMd,
                  {
                    color: active ? C.onPrimary : C.onSurface,
                    fontFamily: active ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                  },
                ]}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable
          onPress={handleNext}
          disabled={!draft.category_id}
          style={[styles.nextBtn, { backgroundColor: C.primary, opacity: draft.category_id ? 1 : 0.4 }]}
        >
          <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Suivant — Photos
          </Text>
          <MaterialIcons name="arrow-forward" size={18} color={C.onPrimary} />
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
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.md,
  },
});
