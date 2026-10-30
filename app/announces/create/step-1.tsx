import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SegmentedButtons } from 'react-native-paper';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { ChoiceChip, SectionLabel, StepTitle, WizardFooter, wizardStyles } from '@/components/forms/create-step-parts';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/queries/use-categories';
import { useCreateListingStore, type CreatableType } from '@/stores/create-listing.store';
import type { AdType } from '@/types/announce';

const TYPE_OPTIONS = [
  { value: 'realestate', label: 'Immobilier', icon: 'home-work' },
  { value: 'land', label: 'Terrain', icon: 'square-foot' },
  { value: 'furniture', label: 'Mobilier', icon: 'chair' },
] as const;

export default function CreateStep1Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft } = useCreateListingStore();
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };
  const isLand = draft.type === 'land';

  // Land listings have no category (usage and surface describe them).
  const { data: categoriesData, isLoading } = useCategories(
    { type: draft.type === 'realestate' ? 'house' : 'furniture' },
    { enabled: !isLand }
  );
  const loadedCategories = categoriesData?.data;
  const categories = loadedCategories ?? [];

  // Like the website, a category is always selected once they are loaded.
  useEffect(() => {
    if (isLand || !loadedCategories || loadedCategories.length === 0) return;
    if (!loadedCategories.some((c) => c.id === draft.category_id)) {
      setDraft({ category_id: loadedCategories[0].id });
    }
  }, [isLand, loadedCategories, draft.category_id, setDraft]);

  const canContinue = !!draft.ad_type && (isLand || !!draft.category_id);

  function selectType(type: CreatableType) {
    if (type !== draft.type) setDraft({ type, category_id: '' });
  }

  return (
    <SafeAreaView style={[wizardStyles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={1} total={4} onBack={() => router.back()} closeMode />

      <ScrollView
        contentContainerStyle={wizardStyles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepTitle title="Informations générales" subtitle="Quel type d'annonce souhaitez-vous publier ?" />

        <View>
          <SectionLabel>Type de bien</SectionLabel>
          <View style={styles.typeGrid}>
            {TYPE_OPTIONS.map((opt) => {
              const active = draft.type === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="radio"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => selectType(opt.value)}
                  style={[
                    styles.typeCard,
                    {
                      borderColor: active ? C.primary : C.outlineVariant,
                      backgroundColor: active ? C.primary + '10' : C.surfaceContainerLow,
                    },
                  ]}
                >
                  <View style={[styles.typeIconBox, { backgroundColor: active ? C.primary : C.surfaceContainerHighest }]}>
                    <MaterialIcons name={opt.icon} size={28} color={active ? C.onPrimary : C.onSurfaceVariant} />
                  </View>
                  <Text
                    style={[
                      Typography.bodyMd,
                      { color: active ? C.primary : C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: Spacing.sm },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {!isLand && (
          <View>
            <SectionLabel>Genre</SectionLabel>
            {isLoading ? (
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>Chargement des catégories…</Text>
            ) : (
              <View style={wizardStyles.wrap}>
                {categories.map((cat) => (
                  <ChoiceChip
                    key={cat.id}
                    label={cat.name}
                    active={draft.category_id === cat.id}
                    onPress={() => setDraft({ category_id: cat.id })}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View>
          <SectionLabel>Mode</SectionLabel>
          <SegmentedButtons
            value={draft.ad_type}
            onValueChange={(v) => setDraft({ ad_type: v as AdType })}
            theme={segmentedTheme}
            buttons={[
              { value: 'location', label: 'Location' },
              { value: 'sale', label: 'Vente' },
            ]}
          />
        </View>
      </ScrollView>

      <WizardFooter label="Suivant" disabled={!canContinue} onPress={() => router.push('/announces/create/step-2')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  typeGrid: { flexDirection: 'row', gap: Spacing.md },
  typeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  typeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
