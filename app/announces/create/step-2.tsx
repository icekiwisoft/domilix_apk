import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MediaUploadGrid } from '@/components/forms/media-upload-grid';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore } from '@/stores/create-listing.store';

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
            { backgroundColor: i < current ? C.primary : C.outlineVariant, flex: 1 },
          ]}
        />
      ))}
    </View>
  );
}

export default function CreateStep2Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft } = useCreateListingStore();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Nouvelle annonce
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={2} total={3} />

        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20, marginBottom: Spacing.xs }]}>
          Photos du bien
        </Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginBottom: Spacing.lg, lineHeight: 22 }]}>
          Ajoutez jusqu'à 4 photos. Une bonne photo augmente les chances de contact.
        </Text>

        <MediaUploadGrid
          uris={draft.medias}
          onChange={(uris) => setDraft({ medias: uris })}
        />

        {/* Tips */}
        <View style={[styles.tips, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }]}>
            Conseils photos
          </Text>
          {[
            'Prenez des photos en paysage, bien éclairées',
            'Montrez toutes les pièces importantes',
            'Évitez les photos floues ou sombres',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <MaterialIcons name="check" size={14} color={C.primary} />
              <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1 }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable
          onPress={() => router.push('/announces/create/step-3')}
          disabled={draft.medias.length === 0}
          style={[styles.nextBtn, { backgroundColor: C.primary, opacity: draft.medias.length > 0 ? 1 : 0.4 }]}
        >
          <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Suivant — Détails
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
    gap: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  tips: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
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
