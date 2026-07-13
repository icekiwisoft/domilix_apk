import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { MediaUploadGrid, MAX_PHOTOS } from '@/components/forms/media-upload-grid';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore } from '@/stores/create-listing.store';
import { useCreateAnnounce } from '@/hooks/queries/use-announces';

export default function CreateStep5Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft, resetDraft } = useCreateListingStore();
  const createAnnounce = useCreateAnnounce();
  const total = draft.type === 'furniture' ? 4 : 5;

  const canPublish = draft.medias.length > 0;

  function handlePublish() {
    if (!canPublish) return;
    const formData = new FormData();
    formData.append('type', draft.type);
    formData.append('ad_type', draft.ad_type);
    formData.append('category_id', draft.category_id);
    formData.append('price', draft.price);
    formData.append('devise', draft.devise);
    formData.append('description', draft.description);
    formData.append('address', draft.address);
    formData.append('city', draft.city);
    if (draft.state) formData.append('state', draft.state);
    if (draft.size) formData.append('size', draft.size);
    if (draft.bedrooms) formData.append('bedrooms', String(draft.bedrooms));
    if (draft.standing) formData.append('standing', draft.standing);
    formData.append('wifi', draft.wifi ? '1' : '0');
    formData.append('air_conditioning', draft.air_conditioning ? '1' : '0');
    formData.append('security_24h', draft.security_24h ? '1' : '0');
    formData.append('smart_tv', draft.smart_tv ? '1' : '0');
    formData.append('equipped_kitchen', draft.equipped_kitchen ? '1' : '0');
    formData.append('gate', draft.gate ? '1' : '0');
    formData.append('pool', draft.pool ? '1' : '0');
    draft.medias.forEach((uri) => {
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('medias[]', { uri, name: filename, type } as unknown as Blob);
    });
    createAnnounce.mutate(formData, {
      onSuccess: () => {
        resetDraft();
        router.replace('/profile/my-listings');
      },
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={total} total={total} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
          Photos
        </Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs, marginBottom: Spacing.lg }]}>
          Ajoutez des photos de votre bien.
        </Text>

        {/* Tip — encouraging, not a requirement */}
        <View style={[styles.tip, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
          <MaterialIcons name="lightbulb-outline" size={18} color={C.primary} />
          <Text style={[Typography.caption, { color: C.onSurface, flex: 1, lineHeight: 18 }]}>
            Plus vous ajoutez de photos, plus votre annonce inspire confiance et attire de contacts. Vous pouvez en ajouter jusqu'à {MAX_PHOTOS}.
          </Text>
        </View>

        <MediaUploadGrid
          uris={draft.medias}
          onChange={(uris) => setDraft({ medias: uris })}
        />

        {/* Recap */}
        <View style={[styles.recap, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }]}>
            Récapitulatif
          </Text>
          <View style={styles.recapRow}>
            <MaterialIcons name={draft.type === 'realestate' ? 'home-work' : 'chair'} size={16} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              {draft.type === 'realestate' ? 'Immobilier' : 'Mobilier'} · {draft.ad_type === 'location' ? 'Location' : 'Vente'}
            </Text>
          </View>
          <View style={styles.recapRow}>
            <MaterialIcons name="photo-library" size={16} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              {draft.medias.length} photo{draft.medias.length > 1 ? 's' : ''}
            </Text>
          </View>
          {draft.price && (
            <View style={styles.recapRow}>
              <MaterialIcons name="payments" size={16} color={C.primary} />
              <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
                {Number(draft.price).toLocaleString('fr-FR')} {draft.devise}
              </Text>
            </View>
          )}
          {draft.city && (
            <View style={styles.recapRow}>
              <MaterialIcons name="place" size={16} color={C.primary} />
              <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
                {draft.address || '—'}, {draft.city}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Button
          mode="contained"
          onPress={handlePublish}
          disabled={!canPublish || createAnnounce.isPending}
          loading={createAnnounce.isPending}
          icon={createAnnounce.isPending ? undefined : 'publish'}
          contentStyle={styles.publishBtnContent}
          style={styles.publishBtn}
        >
          Publier l'annonce
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
    gap: Spacing.lg,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  recap: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  recapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  publishBtn: {
    borderRadius: Radius.md,
  },
  publishBtnContent: {
    height: 52,
    flexDirection: 'row-reverse',
  },
});
