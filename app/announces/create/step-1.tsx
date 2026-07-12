import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, SegmentedButtons } from 'react-native-paper';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore } from '@/stores/create-listing.store';
import type { AdType, AnnounceType } from '@/types/announce';

const TYPE_OPTIONS = [
  { value: 'realestate', label: 'Immobilier', icon: 'home-work' },
  { value: 'furniture', label: 'Mobilier', icon: 'chair' },
] as const;

export default function CreateStep1Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft } = useCreateListingStore();
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };
  const total = draft.type === 'furniture' ? 4 : 5;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={1} total={total} onBack={() => router.back()} closeMode />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
          Type de bien
        </Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs, marginBottom: Spacing.xl }]}>
          Quel type d'annonce souhaitez-vous publier ?
        </Text>

        <View style={styles.typeCol}>
          <Text style={[Typography.labelSm, styles.typeLabel, { color: C.onSurfaceVariant }]}>
            TYPE DE BIEN
          </Text>
          <View style={styles.typeGrid}>
            {TYPE_OPTIONS.map((opt) => {
              const active = draft.type === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="radio"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => setDraft({ type: opt.value as AnnounceType, category_id: '' })}
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
                  <Text style={[Typography.bodyMd, { color: active ? C.primary : C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: Spacing.sm }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.typeCol, { marginTop: Spacing.xl }]}>
          <Text style={[Typography.labelSm, styles.typeLabel, { color: C.onSurfaceVariant }]}>
            TYPE D'ANNONCE
          </Text>
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

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Button
          mode="contained"
          onPress={() => router.push('/announces/create/step-2')}
          disabled={!draft.type || !draft.ad_type}
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
  typeCol: {
    gap: Spacing.sm,
  },
  typeLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
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
