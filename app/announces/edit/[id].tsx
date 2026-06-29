import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnounce, useUpdateAnnounce } from '@/hooks/queries/use-announces';
import { useCategories } from '@/hooks/queries/use-categories';
import type { AdType, AnnounceType, Media, Standing } from '@/types/announce';

// ─── Constants ────────────────────────────────────────────────────────────────

const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Limbé'];
const DEVISES = ['FCFA', 'EUR', 'USD'];
const MAX_PHOTOS = 4;

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

function SectionLabel({ children, color }: { children: string; color: string }) {
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

  const existingMedias: Media[] = announce?.medias ?? [];
  const totalPhotos = existingMedias.length + newMediaUris.length;
  const canAddMore = totalPhotos < MAX_PHOTOS;
  const canSave = !!price && !!description && !!address && !!city;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleAmenity(key: AmenityKey) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePickPhotos() {
    if (!canAddMore) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - totalPhotos,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => a.uri);
      setNewMediaUris((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS - existingMedias.length));
    }
  }

  function removeNewMedia(index: number) {
    setNewMediaUris((prev) => prev.filter((_, i) => i !== index));
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
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
          </Pressable>
          <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
            Modifier l'annonce
          </Text>
          <View style={{ width: 80 }} />
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
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Modifier l'annonce
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={!canSave || updateAnnounce.isPending}
          style={[
            styles.saveBtn,
            {
              backgroundColor: canSave ? C.primary : C.surfaceContainer,
              opacity: updateAnnounce.isPending ? 0.7 : 1,
              ...Shadows.button,
            },
          ]}
        >
          {updateAnnounce.isPending ? (
            <ActivityIndicator size="small" color={C.onPrimary} />
          ) : (
            <Text style={[Typography.labelSm, { color: canSave ? C.onPrimary : C.onSurfaceVariant, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Enregistrer
            </Text>
          )}
        </Pressable>
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

          {/* ── Type de bien ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>Type de bien</SectionLabel>
            <ToggleSwitch
              options={[
                { label: 'Immobilier', value: 'realestate' },
                { label: 'Mobilier', value: 'furniture' },
              ]}
              value={type}
              onChange={(v: AnnounceType) => {
                setType(v);
                setCategoryId('');
              }}
            />
          </Section>

          {/* ── Type d'annonce ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>Type d'annonce</SectionLabel>
            <ToggleSwitch
              options={[
                { label: 'Location', value: 'location' },
                { label: 'Vente', value: 'sale' },
              ]}
              value={adType}
              onChange={(v: AdType) => setAdType(v)}
            />
          </Section>

          {/* ── Catégorie ── */}
          {categories.length > 0 && (
            <Section>
              <SectionLabel color={C.onSurfaceVariant}>Catégorie</SectionLabel>
              <View style={styles.chipGrid}>
                {categories.map((cat) => {
                  const active = categoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={[
                        styles.chip,
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
                          fontSize: 14,
                        },
                      ]}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Section>
          )}

          {/* ── Photos ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>
              Photos ({totalPhotos}/{MAX_PHOTOS})
            </SectionLabel>

            <View style={styles.mediaGrid}>
              {/* Existing locked medias */}
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
                  {/* Lock badge */}
                  <View style={[styles.lockBadge, { backgroundColor: C.inverseSurface + 'CC' }]}>
                    <MaterialIcons name="lock" size={10} color={C.inverseOnSurface} />
                  </View>
                  {/* Main badge */}
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
                  <Pressable
                    onPress={() => removeNewMedia(i)}
                    style={[styles.removeBtn, { backgroundColor: C.error }]}
                  >
                    <MaterialIcons name="close" size={12} color="#fff" />
                  </Pressable>
                  <View style={[styles.newBadge, { backgroundColor: C.primary }]}>
                    <Text style={[Typography.caption, { color: C.onPrimary, fontSize: 9 }]}>Nouvelle</Text>
                  </View>
                </View>
              ))}

              {/* Add slot */}
              {canAddMore && (
                <Pressable
                  onPress={handlePickPhotos}
                  style={[styles.mediaSlot, styles.addSlot, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }]}
                >
                  <MaterialIcons name="add-photo-alternate" size={28} color={C.onSurfaceVariant} />
                  <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 4, textAlign: 'center' }]}>
                    Ajouter
                  </Text>
                </Pressable>
              )}
            </View>

            {existingMedias.length > 0 && (
              <View style={[styles.infoBox, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
                <MaterialIcons name="info-outline" size={14} color={C.onSurfaceVariant} />
                <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1 }]}>
                  Les photos existantes ({existingMedias.length}) sont conservées. Vous pouvez ajouter de nouvelles photos.
                </Text>
              </View>
            )}
          </Section>

          {/* ── Prix ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>Prix</SectionLabel>
            <View style={styles.priceRow}>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor={C.onSurfaceVariant}
                keyboardType="numeric"
                style={[
                  Typography.bodyMd,
                  styles.priceInput,
                  { color: C.onSurface, borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow },
                ]}
              />
              {DEVISES.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDevise(d)}
                  style={[
                    styles.devisePill,
                    {
                      backgroundColor: devise === d ? C.primary : C.surfaceContainer,
                      borderColor: devise === d ? C.primary : C.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[
                    Typography.caption,
                    {
                      color: devise === d ? C.onPrimary : C.onSurface,
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                    },
                  ]}>
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Section>

          {/* ── Description ── */}
          <Section>
            <SectionLabel color={C.onSurfaceVariant}>Description</SectionLabel>
            <TextInput
              value={description}
              onChangeText={setDescription}
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
              {CITIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCity(c)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: city === c ? C.primary : C.surfaceContainer,
                      borderColor: city === c ? C.primary : C.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[Typography.labelSm, { color: city === c ? C.onPrimary : C.onSurface, textTransform: 'none' }]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
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
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => setBedrooms(n)}
                        style={[
                          styles.counterPill,
                          {
                            backgroundColor: bedrooms === n ? C.primary : C.surfaceContainer,
                            borderColor: bedrooms === n ? C.primary : C.outlineVariant,
                          },
                        ]}
                      >
                        <Text style={[Typography.caption, { color: bedrooms === n ? C.onPrimary : C.onSurface }]}>
                          {n === 0 ? 'Studio' : `${n}`}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ width: 100 }}>
                  <SectionLabel color={C.onSurfaceVariant}>Surface m²</SectionLabel>
                  <TextInput
                    value={size}
                    onChangeText={setSize}
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

              {/* Standing */}
              <Section>
                <SectionLabel color={C.onSurfaceVariant}>Standing</SectionLabel>
                <View style={styles.pillRow}>
                  {STANDING_OPTIONS.map((s) => (
                    <Pressable
                      key={s.value}
                      onPress={() => setStanding(standing === s.value ? undefined : s.value)}
                      style={[
                        styles.pill,
                        {
                          flex: 1,
                          backgroundColor: standing === s.value ? C.primary : C.surfaceContainer,
                          borderColor: standing === s.value ? C.primary : C.outlineVariant,
                        },
                      ]}
                    >
                      <Text style={[
                        Typography.caption,
                        {
                          color: standing === s.value ? C.onPrimary : C.onSurface,
                          textAlign: 'center',
                          fontFamily: 'PlusJakartaSans_500Medium',
                        },
                      ]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Section>

              {/* Équipements */}
              <Section>
                <SectionLabel color={C.onSurfaceVariant}>Équipements</SectionLabel>
                <View style={styles.amenityGrid}>
                  {AMENITY_OPTIONS.map((a) => {
                    const active = amenities[a.key];
                    return (
                      <Pressable
                        key={a.key}
                        onPress={() => toggleAmenity(a.key)}
                        style={[
                          styles.amenityChip,
                          {
                            backgroundColor: active ? C.primaryFixed : C.surfaceContainer,
                            borderColor: active ? C.primaryFixedDim : C.outlineVariant,
                          },
                        ]}
                      >
                        <MaterialIcons name={a.icon} size={16} color={active ? C.primary : C.onSurfaceVariant} />
                        <Text style={[
                          Typography.caption,
                          {
                            color: active ? C.primary : C.onSurface,
                            fontFamily: 'PlusJakartaSans_500Medium',
                          },
                        ]}>
                          {a.label}
                        </Text>
                      </Pressable>
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
          <Pressable
            onPress={handleSave}
            disabled={!canSave || updateAnnounce.isPending}
            style={[
              styles.publishBtn,
              {
                backgroundColor: C.primary,
                opacity: canSave && !updateAnnounce.isPending ? 1 : 0.4,
                ...Shadows.button,
              },
            ]}
          >
            {updateAnnounce.isPending ? (
              <ActivityIndicator color={C.onPrimary} size="small" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color={C.onPrimary} />
                <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                  Enregistrer les modifications
                </Text>
              </>
            )}
          </Pressable>
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
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  saveBtn: {
    height: 34,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  section: {},
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
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
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
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Price
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  devisePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },

  // Text area
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    minHeight: 100,
  },

  // Pills
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
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

  // Amenities
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.md,
  },
});
