import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, IconButton, SegmentedButtons, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore } from '@/stores/create-listing.store';
import { useCreateAnnounce } from '@/hooks/queries/use-announces';
import type { Standing } from '@/types/announce';

const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Limbé'];
const DEVISES = ['FCFA', 'EUR', 'USD'];
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

export default function CreateStep3Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft, resetDraft } = useCreateListingStore();
  const createAnnounce = useCreateAnnounce();

  const isRealestate = draft.type === 'realestate';
  const canPublish = draft.price && draft.description && draft.address && draft.city;
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };

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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <IconButton
          icon="arrow-left"
          size={22}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
        />
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Nouvelle annonce
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepIndicator current={3} />

        {/* Price */}
        <View style={styles.section}>
          <TextInput
            mode="outlined"
            label="Prix"
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

        {/* Description */}
        <View style={styles.section}>
          <TextInput
            mode="outlined"
            label="Description"
            value={draft.description}
            onChangeText={(t) => setDraft({ description: t })}
            multiline
            numberOfLines={5}
            style={styles.textArea}
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <SectionLabel>Adresse</SectionLabel>
          <AddressAutocomplete
            value={draft.address}
            onChange={(v) => setDraft({ address: v })}
          />
        </View>

        {/* City */}
        <View style={styles.section}>
          <SectionLabel>Ville</SectionLabel>
          <View style={styles.pillRow}>
            {CITIES.map((city) => {
              const active = draft.city === city;
              return (
                <Chip
                  key={city}
                  compact
                  selected={active}
                  showSelectedCheck={false}
                  onPress={() => setDraft({ city })}
                  style={active ? { backgroundColor: C.primary } : { backgroundColor: C.surfaceContainer }}
                  textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                >
                  {city}
                </Chip>
              );
            })}
          </View>
        </View>

        {/* Realestate only fields */}
        {isRealestate && (
          <>
            <View style={[styles.section, styles.rowSection]}>
              <View style={styles.halfSection}>
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
                        style={active ? { backgroundColor: C.primary } : { backgroundColor: C.surfaceContainer }}
                        textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                      >
                        {n === 0 ? 'Studio' : `${n}`}
                      </Chip>
                    );
                  })}
                </View>
              </View>

              <View style={styles.halfSection}>
                <TextInput
                  mode="outlined"
                  label="Surface (m²)"
                  value={draft.size}
                  onChangeText={(t) => setDraft({ size: t })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <SectionLabel>Standing</SectionLabel>
              <SegmentedButtons
                value={draft.standing ?? ''}
                onValueChange={(v) => setDraft({ standing: v as Standing })}
                theme={segmentedTheme}
                buttons={STANDING_OPTIONS}
              />
            </View>

            <View style={styles.section}>
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
          </>
        )}

        {/* Recap */}
        <View style={[styles.recap, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }]}>
            Récapitulatif
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
            📦 {draft.type === 'realestate' ? 'Immobilier' : 'Mobilier'} · {draft.ad_type === 'location' ? 'Location' : 'Vente'}
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
            🖼️ {draft.medias.length} photo{draft.medias.length > 1 ? 's' : ''}
          </Text>
          {draft.price && (
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              💰 {Number(draft.price).toLocaleString('fr-FR')} {draft.devise}
            </Text>
          )}
          {draft.city && (
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              📍 {draft.address || '—'}, {draft.city}
            </Text>
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
  section: {},
  rowSection: { flexDirection: 'row', gap: Spacing.md },
  halfSection: { flex: 1 },
  deviseSelector: {
    marginTop: Spacing.sm,
  },
  textArea: {
    minHeight: 100,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  counterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  recap: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
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
