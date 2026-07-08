import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
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
        router.replace('/(tabs)/profile/my-listings');
      },
    });
  }

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
        keyboardShouldPersistTaps="handled"
      >
        <StepIndicator current={3} />

        {/* Price */}
        <View style={styles.section}>
          <SectionLabel>Prix</SectionLabel>
          <TextInput
            value={draft.price}
            onChangeText={(t) => setDraft({ price: t })}
            placeholder="0"
            placeholderTextColor={C.onSurfaceVariant}
            keyboardType="numeric"
            style={[
              Typography.bodyMd,
              styles.priceInput,
              { color: C.onSurface, borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow },
            ]}
          />
          <SegmentedButtons
            style={styles.deviseSelector}
            value={draft.devise}
            onValueChange={(v) => setDraft({ devise: v })}
            theme={{ colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } }}
            buttons={DEVISES.map((d) => ({ value: d, label: d }))}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <SectionLabel>Description</SectionLabel>
          <TextInput
            value={draft.description}
            onChangeText={(t) => setDraft({ description: t })}
            placeholder="Décrivez votre bien…"
            placeholderTextColor={C.onSurfaceVariant}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={[
              Typography.bodyMd,
              styles.textArea,
              { color: C.onSurface, borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow },
            ]}
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
            {CITIES.map((city) => (
              <Pressable
                key={city}
                onPress={() => setDraft({ city })}
                style={[
                  styles.pill,
                  { backgroundColor: draft.city === city ? C.primary : C.surfaceContainer, borderColor: draft.city === city ? C.primary : C.outlineVariant },
                ]}
              >
                <Text style={[Typography.labelSm, { color: draft.city === city ? C.onPrimary : C.onSurface, textTransform: 'none' }]}>
                  {city}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Realestate only fields */}
        {isRealestate && (
          <>
            <View style={[styles.section, styles.rowSection]}>
              <View style={styles.halfSection}>
                <SectionLabel>Chambres</SectionLabel>
                <View style={styles.counterRow}>
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => setDraft({ bedrooms: n })}
                      style={[
                        styles.counterPill,
                        { backgroundColor: draft.bedrooms === n ? C.primary : C.surfaceContainer, borderColor: draft.bedrooms === n ? C.primary : C.outlineVariant },
                      ]}
                    >
                      <Text style={[Typography.caption, { color: draft.bedrooms === n ? C.onPrimary : C.onSurface }]}>
                        {n === 0 ? 'Studio' : `${n}`}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.halfSection}>
                <SectionLabel>Surface (m²)</SectionLabel>
                <TextInput
                  value={draft.size}
                  onChangeText={(t) => setDraft({ size: t })}
                  placeholder="0"
                  placeholderTextColor={C.onSurfaceVariant}
                  keyboardType="numeric"
                  style={[
                    Typography.bodyMd,
                    styles.sizeInput,
                    { color: C.onSurface, borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow },
                  ]}
                />
              </View>
            </View>

            <View style={styles.section}>
              <SectionLabel>Standing</SectionLabel>
              <SegmentedButtons
                value={draft.standing ?? ''}
                onValueChange={(v) => setDraft({ standing: v as Standing })}
                theme={{ colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } }}
                buttons={STANDING_OPTIONS}
              />
            </View>

            <View style={styles.section}>
              <SectionLabel>Équipements</SectionLabel>
              <View style={styles.amenityGrid}>
                {AMENITY_OPTIONS.map((a) => {
                  const active = draft[a.key];
                  return (
                    <Pressable
                      key={a.key}
                      onPress={() => setDraft({ [a.key]: !active })}
                      style={[
                        styles.amenityChip,
                        { backgroundColor: active ? C.primaryFixed : C.surfaceContainer, borderColor: active ? C.primaryFixedDim : C.outlineVariant },
                      ]}
                    >
                      <MaterialIcons name={a.icon} size={16} color={active ? C.primary : C.onSurfaceVariant} />
                      <Text style={[Typography.caption, { color: active ? C.primary : C.onSurface, fontFamily: 'PlusJakartaSans_500Medium' }]}>
                        {a.label}
                      </Text>
                    </Pressable>
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
        <Pressable
          onPress={handlePublish}
          disabled={!canPublish || createAnnounce.isPending}
          style={[styles.publishBtn, { backgroundColor: C.primary, opacity: canPublish && !createAnnounce.isPending ? 1 : 0.4 }]}
        >
          {createAnnounce.isPending ? (
            <ActivityIndicator color={C.onPrimary} size="small" />
          ) : (
            <>
              <MaterialIcons name="publish" size={18} color={C.onPrimary} />
              <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                Publier l'annonce
              </Text>
            </>
          )}
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
  section: {},
  rowSection: { flexDirection: 'row', gap: Spacing.md },
  halfSection: { flex: 1 },
  priceInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  deviseSelector: {
    marginTop: Spacing.sm,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    minHeight: 100,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  counterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  counterPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  sizeInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.md,
  },
});
