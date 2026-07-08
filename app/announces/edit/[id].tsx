import { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityIndicator, Button, Chip, IconButton, SegmentedButtons, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnounce, useUpdateAnnounce } from '@/hooks/queries/use-announces';
import { useCategories } from '@/hooks/queries/use-categories';
import type { AdType, AnnounceType, Media, Standing } from '@/types/announce';

// ─── Constants ────────────────────────────────────────────────────────────────

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

type AmenityKey = (typeof AMENITY_OPTIONS)[number]['key'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text style={[
      Typography.labelSm,
      {
        color,
        textTransform: 'uppercase',
        letterSpacing: 1.12,
        marginBottom: Spacing.sm,
      },
    ]}>
      {children}
    </Text>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EditAnnounceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };

  const { data: announce, isLoading } = useAnnounce(id);
  const updateAnnounce = useUpdateAnnounce();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [type, setType] = useState<AnnounceType>('realestate');
  const [adType, setAdType] = useState<AdType>('location');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Douala');
  const [bedrooms, setBedrooms] = useState(0);
  const [size, setSize] = useState('');
  const [standing, setStanding] = useState<Standing | undefined>(undefined);
  const [amenities, setAmenities] = useState<Record<AmenityKey, boolean>>({
    wifi: false,
    pool: false,
    air_conditioning: false,
    security_24h: false,
    gate: false,
    equipped_kitchen: false,
    smart_tv: false,
  });
  const [newMediaUris, setNewMediaUris] = useState<string[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);

  // Pre-populate once announce loads
  const initialized = useRef(false);
  useEffect(() => {
    if (!announce || initialized.current) return;
    initialized.current = true;
    setType(announce.type);
    setAdType(announce.ad_type);
    setCategoryId(announce.category_id ?? '');
    setPrice(String(announce.price ?? ''));
    setDevise(announce.devise ?? 'FCFA');
    setDescription(announce.description ?? '');
    setAddress(announce.address ?? '');
    setCity(announce.city ?? 'Douala');
    setBedrooms(announce.bedrooms ?? 0);
    setSize(announce.size != null ? String(announce.size) : '');
    setStanding(announce.standing);
    setAmenities({
      wifi: !!announce.wifi,
      pool: !!announce.pool,
      air_conditioning: !!announce.air_conditioning,
      security_24h: !!announce.security_24h,
      gate: !!announce.gate,
      equipped_kitchen: !!announce.equipped_kitchen,
      smart_tv: !!announce.smart_tv,
    });
  }, [announce]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const categoryType = type === 'realestate' ? 'house' : 'furniture';
  const { data: categoriesData } = useCategories({ type: categoryType });
  const categories = categoriesData?.data ?? [];
  const isRealestate = type === 'realestate';

  const allExistingMedias: Media[] = announce?.medias ?? [];
  const existingMedias = allExistingMedias.filter((m) => !removedMediaIds.includes(m.id));
  const totalPhotos = existingMedias.length + newMediaUris.length;
  const canSave = !!price && !!description && !!address && !!city;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleAmenity(key: AmenityKey) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => a.uri);
      setNewMediaUris((prev) => [...prev, ...picked]);
    }
  }

  function removeNewMedia(index: number) {
    setNewMediaUris((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingMedia(mediaId: string) {
    setRemovedMediaIds((prev) => [...prev, mediaId]);
  }

  function handleSave() {
    if (!canSave) return;
    const formData = new FormData();
    formData.append('type', type);
    formData.append('ad_type', adType);
    if (categoryId) formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('devise', devise);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('city', city);
    if (size) formData.append('size', size);
    if (bedrooms) formData.append('bedrooms', String(bedrooms));
    if (standing) formData.append('standing', standing);
    formData.append('wifi', amenities.wifi ? '1' : '0');
    formData.append('air_conditioning', amenities.air_conditioning ? '1' : '0');
    formData.append('security_24h', amenities.security_24h ? '1' : '0');
    formData.append('smart_tv', amenities.smart_tv ? '1' : '0');
    formData.append('equipped_kitchen', amenities.equipped_kitchen ? '1' : '0');
    formData.append('gate', amenities.gate ? '1' : '0');
    formData.append('pool', amenities.pool ? '1' : '0');

    newMediaUris.forEach((uri) => {
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('medias[]', { uri, name: filename, type: mimeType } as unknown as Blob);
    });

    removedMediaIds.forEach((mediaId) => {
      formData.append('remove_media_ids[]', mediaId);
    });

    updateAnnounce.mutate(
      { id, formData },
      {
        onSuccess: () => {
          toast.show('Annonce mise à jour.', 'success');
          router.back();
        },
        onError: () => {
          toast.show('Erreur lors de la mise à jour.', 'error');
        },
      }
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant }]}>
          <IconButton
            icon="arrow-left"
            size={22}
            onPress={() => router.back()}
            accessibilityLabel="Retour"
          />
          <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
            Modifier l'annonce
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.md }]}>
            Chargement…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant }]}>
        <IconButton
          icon="arrow-left"
          size={22}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
        />
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Modifier l'annonce
        </Text>
        <Button
          mode="contained"
          compact
          onPress={handleSave}
          disabled={!canSave || updateAnnounce.isPending}
          loading={updateAnnounce.isPending}
        >
          Enregistrer
        </Button>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Type de bien + Type d'annonce — même ligne ── */}
          <View style={styles.typeRow}>
            <View style={styles.typeCol}>
              <Text style={[Typography.labelSm, styles.typeLabel, { color: C.onSurfaceVariant }]}>
                TYPE DE BIEN
              </Text>
              <SegmentedButtons
                value={type}
                onValueChange={(v) => {
                  setType(v as AnnounceType);
                  setCategoryId('');
                }}
                theme={segmentedTheme}
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
                value={adType}
                onValueChange={(v) => setAdType(v as AdType)}
                theme={segmentedTheme}
                buttons={[
                  { value: 'location', label: 'Location' },
                  { value: 'sale', label: 'Vente' },
                ]}
              />
            </View>
          </View>

          {/* ── Catégorie ── */}
          {categories.length > 0 && (
            <Section>
              <SectionLabel color={C.onSurfaceVariant}>Catégorie</SectionLabel>
              <View style={styles.chipGrid}>
                {categories.map((cat) => {
                  const active = categoryId === cat.id;
                  return (
                    <Chip
                      key={cat.id}
                      selected={active}
                      showSelectedCheck={false}
                      onPress={() => setCategoryId(cat.id)}
                      style={active ? { backgroundColor: C.primary } : { backgroundColor: C.surfaceContainer }}
                      textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                    >
                      {cat.name}
                    </Chip>
                  );
                })}
              </View>
            </Section>
          )}

          {/* ── Photos ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>
              {`Photos (${totalPhotos})`}
            </SectionLabel>

            <View style={styles.mediaGrid}>
              {/* Existing photos */}
              {existingMedias.map((media, i) => (
                <View
                  key={media.id}
                  style={[styles.mediaSlot, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }]}
                >
                  <Image
                    source={{ uri: media.thumbnail ?? media.file }}
                    style={styles.mediaImg}
                    resizeMode="cover"
                  />
                  <IconButton
                    icon="close"
                    accessibilityLabel="Supprimer cette photo"
                    onPress={() => removeExistingMedia(media.id)}
                    iconColor={C.onError}
                    containerColor={C.error}
                    size={12}
                    style={styles.removeBtn}
                  />
                  {i === 0 && (
                    <View style={[styles.mainBadge, { backgroundColor: C.primary }]}>
                      <Text style={[Typography.caption, { color: C.onPrimary, fontSize: 9 }]}>
                        Principale
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {/* New photos (local URIs) */}
              {newMediaUris.map((uri, i) => (
                <View
                  key={`new-${i}`}
                  style={[styles.mediaSlot, { borderColor: C.primary + '88', backgroundColor: C.primaryFixed + '44' }]}
                >
                  <Image source={{ uri }} style={styles.mediaImg} resizeMode="cover" />
                  <IconButton
                    icon="close"
                    accessibilityLabel="Supprimer cette photo"
                    onPress={() => removeNewMedia(i)}
                    iconColor={C.onError}
                    containerColor={C.error}
                    size={12}
                    style={styles.removeBtn}
                  />
                  <View style={[styles.newBadge, { backgroundColor: C.primary }]}>
                    <Text style={[Typography.caption, { color: C.onPrimary, fontSize: 9 }]}>Nouvelle</Text>
                  </View>
                </View>
              ))}

              {/* Add slot — always visible */}
              <Pressable
                onPress={handlePickPhotos}
                accessibilityRole="button"
                accessibilityLabel="Ajouter des photos"
                style={[styles.mediaSlot, styles.addSlot, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }]}
              >
                <MaterialIcons name="add-photo-alternate" size={28} color={C.onSurfaceVariant} />
                <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 4, textAlign: 'center' }]}>
                  Ajouter
                </Text>
              </Pressable>
            </View>

            {removedMediaIds.length > 0 && (
              <View style={[styles.infoBox, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '44' }]}>
                <MaterialIcons name="delete-outline" size={14} color={C.error} />
                <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
                  {removedMediaIds.length} photo{removedMediaIds.length > 1 ? 's' : ''} supprimée{removedMediaIds.length > 1 ? 's' : ''} à l'enregistrement.
                </Text>
              </View>
            )}
          </Section>

          {/* ── Prix ── */}
          <Section>
            <TextInput
              mode="outlined"
              label="Prix"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <SegmentedButtons
              style={styles.deviseSelector}
              value={devise}
              onValueChange={setDevise}
              theme={segmentedTheme}
              buttons={DEVISES.map((d) => ({ value: d, label: d }))}
            />
          </Section>

          {/* ── Description ── */}
          <Section>
            <TextInput
              mode="outlined"
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              style={styles.textArea}
            />
          </Section>

          {/* ── Adresse ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>Adresse</SectionLabel>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
            />
          </Section>

          {/* ── Ville ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>Ville</SectionLabel>
            <View style={styles.pillRow}>
              {CITIES.map((c) => {
                const active = city === c;
                return (
                  <Chip
                    key={c}
                    compact
                    selected={active}
                    showSelectedCheck={false}
                    onPress={() => setCity(c)}
                    style={active ? { backgroundColor: C.primary } : { backgroundColor: C.surfaceContainer }}
                    textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                  >
                    {c}
                  </Chip>
                );
              })}
            </View>
          </Section>

          {/* ── Immobilier uniquement ── */}
          {isRealestate && (
            <>
              {/* Chambres + Surface */}
              <View style={styles.rowSection}>
                <View style={{ flex: 1 }}>
                  <SectionLabel color={C.onSurfaceVariant}>Chambres</SectionLabel>
                  <View style={styles.pillRow}>
                    {[0, 1, 2, 3, 4, 5].map((n) => {
                      const active = bedrooms === n;
                      return (
                        <Chip
                          key={n}
                          compact
                          selected={active}
                          showSelectedCheck={false}
                          onPress={() => setBedrooms(n)}
                          style={active ? { backgroundColor: C.primary } : { backgroundColor: C.surfaceContainer }}
                          textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                        >
                          {n === 0 ? 'Studio' : `${n}`}
                        </Chip>
                      );
                    })}
                  </View>
                </View>

                <View style={{ width: 120 }}>
                  <TextInput
                    mode="outlined"
                    label="Surface (m²)"
                    value={size}
                    onChangeText={setSize}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Standing */}
              <Section>
                <SectionLabel color={C.onSurfaceVariant}>Standing</SectionLabel>
                <SegmentedButtons
                  value={standing ?? ''}
                  onValueChange={(v) => setStanding(v as Standing)}
                  theme={segmentedTheme}
                  buttons={STANDING_OPTIONS}
                />
              </Section>

              {/* Équipements */}
              <Section>
                <SectionLabel color={C.onSurfaceVariant}>Équipements</SectionLabel>
                <View style={styles.amenityGrid}>
                  {AMENITY_OPTIONS.map((a) => {
                    const active = amenities[a.key];
                    return (
                      <Chip
                        key={a.key}
                        compact
                        selected={active}
                        showSelectedCheck={false}
                        icon={({ size }) => (
                          <MaterialIcons name={a.icon} size={size} color={active ? C.primary : C.onSurfaceVariant} />
                        )}
                        onPress={() => toggleAmenity(a.key)}
                        style={active ? { backgroundColor: C.primaryFixed, borderColor: C.primaryFixedDim } : { backgroundColor: C.surfaceContainer }}
                        textStyle={{ color: active ? C.primary : C.onSurface }}
                      >
                        {a.label}
                      </Chip>
                    );
                  })}
                </View>
              </Section>
            </>
          )}

          {/* ── Récap ── */}
          <View style={[styles.recap, { backgroundColor: C.primaryContainer + '12', borderColor: C.primaryContainer + '28' }]}>
            <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }]}>
              Récapitulatif
            </Text>
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              📦 {type === 'realestate' ? 'Immobilier' : 'Mobilier'} · {adType === 'location' ? 'Location' : 'Vente'}
            </Text>
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              🖼️ {totalPhotos} photo{totalPhotos > 1 ? 's' : ''} ({existingMedias.length} existante{existingMedias.length > 1 ? 's' : ''}{newMediaUris.length > 0 ? ` + ${newMediaUris.length} nouvelle${newMediaUris.length > 1 ? 's' : ''}` : ''})
            </Text>
            {price && (
              <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
                💰 {Number(price).toLocaleString('fr-FR')} {devise}
              </Text>
            )}
            {city && (
              <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
                📍 {address || '—'}, {city}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* ── Footer ── */}
        <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!canSave || updateAnnounce.isPending}
            loading={updateAnnounce.isPending}
            icon={updateAnnounce.isPending ? undefined : 'check-circle'}
            contentStyle={styles.publishBtnContent}
            style={styles.publishBtn}
          >
            Enregistrer les modifications
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeCol: {
    flex: 1,
    gap: Spacing.sm,
  },
  typeLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  rowSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },

  // Category chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  // Media grid
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mediaSlot: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImg: { width: '100%', height: '100%' },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  newBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    margin: 0,
  },
  addSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },

  deviseSelector: {
    marginTop: Spacing.sm,
  },

  // Text area
  textArea: {
    minHeight: 100,
  },

  // Pills
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },

  // Amenities
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  // Recap
  recap: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },

  // Footer
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
