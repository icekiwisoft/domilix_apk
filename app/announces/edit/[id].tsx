import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, ProgressBar, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ChoiceChip, SectionLabel } from '@/components/forms/create-step-parts';
import { MediaPickerGrid } from '@/components/forms/media-picker-grid';
import { OptionPickerDialog } from '@/components/forms/option-picker-dialog';
import { useToast } from '@/components/ui/toast';
import {
  AMENITY_OPTIONS,
  CURRENCY_OPTIONS,
  LAND_USE_OPTIONS,
  MAX_MEDIAS,
  PERIOD_OPTIONS,
  currencyLabel,
  type AmenityKey,
} from '@/constants/listing';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnounce, useUpdateAnnounce, type UploadProgress } from '@/hooks/queries/use-announces';
import { useCategories } from '@/hooks/queries/use-categories';
import { getApiErrorMessage } from '@/lib/api-error';
import { GeoapifyService } from '@/services/geoapify.service';
import type { PickedMedia } from '@/services/uploads.service';
import type { Announce } from '@/types/announce';

// Same fields as the website's edit dialog (EditAdModal).

const CONDITION_OPTIONS = [
  { value: 'used', label: 'Occasion' },
  { value: 'new', label: 'Neuf' },
] as const;

const AD_TYPE_OPTIONS = [
  { value: 'location', label: 'Location' },
  { value: 'sale', label: 'Vente' },
] as const;

const EDIT_AMENITIES: { key: AmenityKey; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  ...AMENITY_OPTIONS,
  { key: 'garden', label: 'Jardin', icon: 'yard' },
];

const toText = (value: unknown) => (value === null || value === undefined ? '' : String(value));

function getDetails(ad: Announce) {
  return {
    description: toText(ad.description),
    price: toText(ad.price),
    ad_type: toText(ad.ad_type || 'location'),
    category_id: toText(ad.category?.id ?? ad.category_id),
    period: toText(ad.period),
    devise: !ad.devise || ad.devise === 'XOF' ? 'XAF' : ad.devise,
    contact_phone: toText(ad.contact_phone),
    contact_email: toText(ad.contact_email),
    address: toText(ad.address),
    city: toText(ad.city),
    neighbourhood: toText(ad.neighbourhood ?? ad.neighborhood),
    state: toText(ad.state),
    country: toText(ad.country),
    zip: toText(ad.zip ?? ad.postal_code),
    bedroom: toText(ad.bedroom ?? ad.bedrooms),
    mainroom: toText(ad.mainroom),
    toilet: toText(ad.toilet),
    kitchen: toText(ad.kitchen),
    size: toText(ad.size),
    caution: toText(ad.caution),
    height: toText(ad.height),
    width: toText(ad.width),
    length: toText(ad.length),
    weight: toText(ad.weight),
    condition: toText(ad.condition || 'used'),
    land_use: toText(ad.land_use || 'residential'),
    land_title: !!ad.land_title,
  };
}

type Details = ReturnType<typeof getDetails>;

function getAmenities(ad: Announce): Record<AmenityKey, boolean> {
  return {
    wifi: !!ad.wifi,
    pool: !!ad.pool,
    air_conditioning: !!ad.air_conditioning,
    security_24h: !!ad.security_24h,
    gate: !!ad.gate,
    equipped_kitchen: !!ad.equipped_kitchen,
    smart_tv: !!ad.smart_tv,
    furnitured: !!ad.furnitured,
    garage: !!ad.garage,
    garden: !!ad.garden,
  };
}

const digits = (text: string) => text.replace(/\D/g, '');
const decimal = (text: string) => text.replace(',', '.').replace(/[^0-9.]/g, '');
const flag = (value: boolean) => (value ? '1' : '0');
const orNull = (text: string) => (text ? Number(text) : null);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
      <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function EditAnnounceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();

  const { data: announce, isLoading } = useAnnounce(id);
  const updateAnnounce = useUpdateAnnounce();

  const [details, setDetails] = useState<Details | null>(null);
  const [amenities, setAmenities] = useState<Record<AmenityKey, boolean> | null>(null);
  const [manualAddress, setManualAddress] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [coordinates, setCoordinates] = useState({ longitude: '', latitude: '' });
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [newMedias, setNewMedias] = useState<PickedMedia[]>([]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState('');

  // Pre-populate once the listing has loaded.
  const initialized = useRef(false);
  useEffect(() => {
    if (!announce || initialized.current) return;
    initialized.current = true;
    setDetails(getDetails(announce));
    setAmenities(getAmenities(announce));
    setManualAddress(announce.location_source === 'manual');
    setCoordinates({ longitude: toText(announce.longitude), latitude: toText(announce.latitude) });
    setShowCoordinates(announce.longitude != null && announce.latitude != null);
  }, [announce]);

  const isLand = announce?.type === 'land';
  const isRealestate = announce?.type === 'realestate';
  const { data: categoriesData } = useCategories(
    { type: isRealestate ? 'house' : 'furniture' },
    { enabled: !!announce && !isLand }
  );
  const categories = categoriesData?.data ?? [];

  const existingMedias = (announce?.medias ?? []).filter((m) => !removedMediaIds.includes(String(m.id)));
  const totalMedias = existingMedias.length + newMedias.length;

  function update<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((current) => (current ? { ...current, [key]: value } : current));
  }

  function toggleAmenity(key: AmenityKey) {
    setAmenities((current) => (current ? { ...current, [key]: !current[key] } : current));
  }

  function setManualMode(manual: boolean) {
    setManualAddress(manual);
    setError('');
    if (manual) {
      setCoordinates({ longitude: '', latitude: '' });
      setShowCoordinates(false);
    }
  }

  async function useCurrentPosition() {
    setLocating(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError("Autorisez l'accès à la localisation dans les paramètres de votre téléphone.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoordinates({ longitude: String(coords.longitude), latitude: String(coords.latitude) });
      setShowCoordinates(true);
      try {
        const place = await GeoapifyService.reverseGeocode(coords.longitude, coords.latitude);
        setDetails((current) =>
          current
            ? {
                ...current,
                address: place.text || place.place_name || current.address,
                neighbourhood: place.neighborhood ?? current.neighbourhood,
                city: place.city ?? current.city,
                state: place.state ?? current.state,
                country: place.country ?? current.country,
                zip: place.postal_code ?? current.zip,
              }
            : current
        );
      } catch {
        // The backend resolves the address from the coordinates on save.
      }
    } catch {
      setError("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.");
    } finally {
      setLocating(false);
    }
  }

  function handleSave() {
    if (!details || !amenities || !announce) return;

    const longitude = Number.parseFloat(coordinates.longitude.replace(',', '.'));
    const latitude = Number.parseFloat(coordinates.latitude.replace(',', '.'));
    const hasCoordinates = Number.isFinite(longitude) && Number.isFinite(latitude);

    if (!details.description.trim() || !details.price.trim()) {
      setError('La description et le prix sont obligatoires.');
      return;
    }
    if (hasCoordinates && (Math.abs(longitude) > 180 || Math.abs(latitude) > 90)) {
      setError('Coordonnées GPS invalides.');
      return;
    }
    if (manualAddress && !details.address.trim() && !details.neighbourhood.trim() && !details.city.trim()) {
      setError('Veuillez saisir au moins une adresse, un repère, un quartier ou une ville.');
      return;
    }
    if (totalMedias === 0) {
      setError('Veuillez ajouter au moins une photo ou une vidéo.');
      return;
    }
    setError('');

    const typeFields = isLand
      ? {
          size: orNull(details.size),
          land_use: details.land_use || 'residential',
          land_title: flag(details.land_title),
          gate: flag(amenities.gate),
        }
      : isRealestate
        ? {
            bedroom: Number(details.bedroom || 0),
            mainroom: Number(details.mainroom || 0),
            toilet: Number(details.toilet || 0),
            kitchen: Number(details.kitchen || 0),
            size: orNull(details.size),
            caution: orNull(details.caution),
            ...Object.fromEntries(EDIT_AMENITIES.map(({ key }) => [key, flag(amenities[key])])),
          }
        : {
            condition: details.condition || 'used',
            height: orNull(details.height),
            width: orNull(details.width),
            length: orNull(details.length),
            weight: orNull(details.weight),
          };

    const payload: Record<string, unknown> = {
      description: details.description,
      price: Number(details.price),
      ad_type: details.ad_type,
      category_id: details.category_id || null,
      period: details.ad_type === 'location' ? details.period : '',
      devise: details.devise,
      contact_phone: details.contact_phone,
      contact_email: details.contact_email,
      address: details.address,
      city: details.city,
      neighbourhood: details.neighbourhood,
      state: details.state,
      country: details.country,
      zip: details.zip,
      location_source: manualAddress ? 'manual' : 'auto',
      hide_on_map: manualAddress ? '1' : '0',
      ...(!manualAddress && hasCoordinates ? { localization: [String(longitude), String(latitude)] } : {}),
      ...typeFields,
    };

    // The API replaces the ad's media with `media_ids`: keep the ones that were
    // not removed, the new ones are uploaded by the hook first.
    const keepMediaIds = existingMedias.map((m) => String(m.id));

    updateAnnounce.mutate(
      { id, payload, newMedia: newMedias, keepMediaIds, onProgress: setProgress },
      {
        onSuccess: () => {
          toast.show('Annonce mise à jour.', 'success');
          router.back();
        },
        onError: (e) => {
          setProgress(null);
          setError(getApiErrorMessage(e, 'Erreur lors de la mise à jour.'));
        },
      }
    );
  }

  const saving = updateAnnounce.isPending;

  const header = (action?: React.ReactNode) => (
    <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant }]}>
      <IconButton icon="arrow-left" size={22} onPress={() => router.back()} accessibilityLabel="Retour" />
      <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>{"Modifier l'annonce"}</Text>
      {action ?? <View style={styles.headerSpacer} />}
    </View>
  );

  if (isLoading || !details || !amenities || !announce) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        {header()}
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.md }]}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLocation = details.ad_type === 'location';
  const hasCoordinates = !!coordinates.longitude && !!coordinates.latitude;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {header(
        <Button mode="contained" compact onPress={handleSave} disabled={saving} loading={saving}>
          Enregistrer
        </Button>
      )}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Section title="Essentiel">
            <TextInput
              mode="outlined"
              label="Description"
              value={details.description}
              onChangeText={(t) => update('description', t)}
              multiline
              numberOfLines={5}
              style={styles.textArea}
            />
            {!isLand && categories.length > 0 && (
              <View>
                <SectionLabel>Catégorie</SectionLabel>
                <View style={styles.wrap}>
                  {categories.map((cat) => (
                    <ChoiceChip
                      key={cat.id}
                      label={cat.name}
                      active={details.category_id === cat.id}
                      onPress={() => update('category_id', cat.id)}
                    />
                  ))}
                </View>
              </View>
            )}
            <View>
              <SectionLabel>{"Type d'annonce"}</SectionLabel>
              <View style={styles.wrap}>
                {AD_TYPE_OPTIONS.map((opt) => (
                  <ChoiceChip
                    key={opt.value}
                    label={opt.label}
                    active={details.ad_type === opt.value}
                    onPress={() => update('ad_type', opt.value)}
                  />
                ))}
              </View>
            </View>
            <TextInput
              mode="outlined"
              label="Téléphone à afficher"
              placeholder="Optionnel, sinon téléphone pro"
              value={details.contact_phone}
              onChangeText={(t) => update('contact_phone', t)}
              keyboardType="phone-pad"
            />
            <TextInput
              mode="outlined"
              label="Email à afficher"
              placeholder="Optionnel, sinon email du profil"
              value={details.contact_email}
              onChangeText={(t) => update('contact_email', t)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Section>

          <Section title="Médias">
            {existingMedias.length > 0 && (
              <View style={styles.wrap}>
                {existingMedias.map((media) => {
                  const isVideo = (media.type ?? '').startsWith('video/');
                  return (
                    <View key={media.id} style={[styles.mediaSlot, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }]}>
                      <Image source={{ uri: media.thumbnail ?? media.file }} style={styles.mediaImg} resizeMode="cover" />
                      {isVideo && (
                        <View style={styles.videoBadge}>
                          <MaterialIcons name="videocam" size={14} color="#fff" />
                        </View>
                      )}
                      <IconButton
                        icon="close"
                        accessibilityLabel="Supprimer ce média"
                        onPress={() => setRemovedMediaIds((prev) => [...prev, String(media.id)])}
                        iconColor={C.onError}
                        containerColor={C.error}
                        size={13}
                        style={styles.removeBtn}
                      />
                    </View>
                  );
                })}
              </View>
            )}
            <MediaPickerGrid
              medias={newMedias}
              onChange={(medias) => {
                setError('');
                setNewMedias(medias);
              }}
              max={Math.max(MAX_MEDIAS - existingMedias.length, 0)}
              mainMedia={false}
              disabled={saving}
            />
            {removedMediaIds.length > 0 && (
              <Pressable onPress={() => setRemovedMediaIds([])} accessibilityRole="button">
                <Text style={[Typography.caption, { color: C.error }]}>
                  {`${removedMediaIds.length} média${removedMediaIds.length > 1 ? 's' : ''} supprimé${removedMediaIds.length > 1 ? 's' : ''} à l'enregistrement. Toucher pour annuler.`}
                </Text>
              </Pressable>
            )}
            {progress && saving && (
              <View style={styles.progress}>
                <Text numberOfLines={1} style={[Typography.caption, { color: C.onSurface }]}>
                  {`Upload ${progress.current}/${progress.total} · ${progress.fileName} — ${progress.percent}%`}
                </Text>
                <ProgressBar progress={progress.percent / 100} color={C.primary} />
              </View>
            )}
          </Section>

          <Section title="Prix et disponibilité">
            <View style={styles.row}>
              <TextInput
                mode="outlined"
                label="Prix"
                value={details.price}
                onChangeText={(t) => update('price', decimal(t))}
                keyboardType="decimal-pad"
                style={styles.flex}
              />
              <Button
                mode="outlined"
                icon="chevron-down"
                contentStyle={styles.currencyContent}
                style={styles.currency}
                onPress={() => setCurrencyOpen(true)}
                accessibilityLabel={`Devise : ${currencyLabel(details.devise)}`}
              >
                {details.devise}
              </Button>
            </View>
            {isLocation && (
              <View>
                <SectionLabel>Période</SectionLabel>
                <View style={styles.wrap}>
                  <ChoiceChip label="Non précisée" active={!details.period} onPress={() => update('period', '')} />
                  {PERIOD_OPTIONS.map((opt) => (
                    <ChoiceChip
                      key={opt.value}
                      label={opt.label}
                      active={details.period === opt.value}
                      onPress={() => update('period', opt.value)}
                    />
                  ))}
                </View>
              </View>
            )}
          </Section>

          <Section title="Localisation">
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: manualAddress }}
              onPress={() => setManualMode(!manualAddress)}
              style={[
                styles.modeCard,
                {
                  borderColor: manualAddress ? C.primary : C.outlineVariant,
                  backgroundColor: manualAddress ? C.primary + '10' : C.surfaceContainerLow,
                },
              ]}
            >
              <MaterialIcons
                name={manualAddress ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={manualAddress ? C.primary : C.onSurfaceVariant}
              />
              <View style={styles.flex}>
                <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
                  {"Entrer l'adresse manuellement"}
                </Text>
                <Text style={[Typography.caption, { color: C.onSurfaceVariant, lineHeight: 18 }]}>
                  {"Idéal si le bien se repère par quartier, carrefour ou lieu connu. Dans ce mode, l'annonce ne sera pas affichée sur la carte."}
                </Text>
              </View>
            </Pressable>

            {manualAddress ? (
              <View style={styles.fields}>
                <TextInput mode="outlined" label="Adresse ou repère" value={details.address} onChangeText={(t) => update('address', t)} />
                <TextInput mode="outlined" label="Quartier" value={details.neighbourhood} onChangeText={(t) => update('neighbourhood', t)} />
                <TextInput mode="outlined" label="Ville" value={details.city} onChangeText={(t) => update('city', t)} />
                <TextInput mode="outlined" label="Pays" value={details.country} onChangeText={(t) => update('country', t)} />
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                  Ne pas afficher sur la carte est activé automatiquement.
                </Text>
              </View>
            ) : (
              <View style={styles.fields}>
                <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
                  Position exacte du bien
                </Text>
                <Text style={[Typography.caption, { color: C.onSurfaceVariant, lineHeight: 18 }]}>
                  {"Utilisez votre position actuelle ou entrez longitude puis latitude. Domilix remplira l'adresse automatiquement."}
                </Text>
                <View style={styles.row}>
                  <Button
                    mode="contained"
                    icon={locating ? undefined : 'crosshairs-gps'}
                    loading={locating}
                    disabled={locating}
                    onPress={useCurrentPosition}
                    style={styles.flex}
                  >
                    {locating ? 'Récupération...' : 'Position actuelle'}
                  </Button>
                  <Button mode="outlined" onPress={() => setShowCoordinates((v) => !v)} style={styles.flex}>
                    {showCoordinates ? 'Masquer' : 'Saisie manuelle'}
                  </Button>
                </View>
                {(showCoordinates || hasCoordinates) && (
                  <View style={styles.row}>
                    <TextInput
                      mode="outlined"
                      label="Longitude"
                      value={coordinates.longitude}
                      onChangeText={(t) => setCoordinates((c) => ({ ...c, longitude: t }))}
                      keyboardType="numbers-and-punctuation"
                      style={styles.flex}
                    />
                    <TextInput
                      mode="outlined"
                      label="Latitude"
                      value={coordinates.latitude}
                      onChangeText={(t) => setCoordinates((c) => ({ ...c, latitude: t }))}
                      keyboardType="numbers-and-punctuation"
                      style={styles.flex}
                    />
                  </View>
                )}
                {[details.address, details.neighbourhood, details.city, details.state, details.country].some(Boolean) && (
                  <View style={[styles.detected, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
                    <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                      Lieu détecté
                    </Text>
                    {[details.address, details.neighbourhood, details.city, details.state, details.country]
                      .filter(Boolean)
                      .map((line) => (
                        <Text key={line} style={[Typography.bodyMd, { color: C.onSurface }]}>
                          {line}
                        </Text>
                      ))}
                  </View>
                )}
              </View>
            )}
          </Section>

          {isLand && (
            <Section title="Caractéristiques du terrain">
              <TextInput
                mode="outlined"
                label="Surface (m²)"
                value={details.size}
                onChangeText={(t) => update('size', decimal(t))}
                keyboardType="decimal-pad"
              />
              <View>
                <SectionLabel>Usage</SectionLabel>
                <View style={styles.wrap}>
                  {LAND_USE_OPTIONS.map((opt) => (
                    <ChoiceChip
                      key={opt.value}
                      label={opt.label}
                      active={details.land_use === opt.value}
                      onPress={() => update('land_use', opt.value)}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.wrap}>
                <ChoiceChip
                  label="Titre foncier"
                  icon="verified-user"
                  active={details.land_title}
                  onPress={() => update('land_title', !details.land_title)}
                />
                <ChoiceChip label="Clôturé" icon="lock" active={amenities.gate} onPress={() => toggleAmenity('gate')} />
              </View>
            </Section>
          )}

          {isRealestate && (
            <Section title="Caractéristiques immobilier">
              <View style={styles.row}>
                <TextInput mode="outlined" label="Chambres" value={details.bedroom} onChangeText={(t) => update('bedroom', digits(t))} keyboardType="number-pad" style={styles.flex} />
                <TextInput mode="outlined" label="Salons" value={details.mainroom} onChangeText={(t) => update('mainroom', digits(t))} keyboardType="number-pad" style={styles.flex} />
              </View>
              <View style={styles.row}>
                <TextInput mode="outlined" label="Toilettes" value={details.toilet} onChangeText={(t) => update('toilet', digits(t))} keyboardType="number-pad" style={styles.flex} />
                <TextInput mode="outlined" label="Cuisines" value={details.kitchen} onChangeText={(t) => update('kitchen', digits(t))} keyboardType="number-pad" style={styles.flex} />
              </View>
              <View style={styles.row}>
                <TextInput mode="outlined" label="Caution" value={details.caution} onChangeText={(t) => update('caution', decimal(t))} keyboardType="decimal-pad" style={styles.flex} />
                <TextInput mode="outlined" label="Taille (m²)" value={details.size} onChangeText={(t) => update('size', decimal(t))} keyboardType="decimal-pad" style={styles.flex} />
              </View>
              <View>
                <SectionLabel>Commodités</SectionLabel>
                <View style={styles.wrap}>
                  {EDIT_AMENITIES.map((amenity) => (
                    <ChoiceChip
                      key={amenity.key}
                      label={amenity.label}
                      icon={amenity.icon}
                      active={amenities[amenity.key]}
                      onPress={() => toggleAmenity(amenity.key)}
                    />
                  ))}
                </View>
              </View>
            </Section>
          )}

          {!isLand && !isRealestate && (
            <Section title="Dimensions mobilier">
              <View>
                <SectionLabel>État</SectionLabel>
                <View style={styles.wrap}>
                  {CONDITION_OPTIONS.map((opt) => (
                    <ChoiceChip
                      key={opt.value}
                      label={opt.label}
                      active={details.condition === opt.value}
                      onPress={() => update('condition', opt.value)}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.row}>
                <TextInput mode="outlined" label="Hauteur" value={details.height} onChangeText={(t) => update('height', decimal(t))} keyboardType="decimal-pad" style={styles.flex} />
                <TextInput mode="outlined" label="Largeur" value={details.width} onChangeText={(t) => update('width', decimal(t))} keyboardType="decimal-pad" style={styles.flex} />
              </View>
              <View style={styles.row}>
                <TextInput mode="outlined" label="Longueur" value={details.length} onChangeText={(t) => update('length', decimal(t))} keyboardType="decimal-pad" style={styles.flex} />
                <TextInput mode="outlined" label="Poids" value={details.weight} onChangeText={(t) => update('weight', decimal(t))} keyboardType="decimal-pad" style={styles.flex} />
              </View>
            </Section>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
          {error ? <Text style={[Typography.caption, styles.footerError, { color: C.error }]}>{error}</Text> : null}
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            icon={saving ? undefined : 'check-circle'}
            contentStyle={styles.saveBtnContent}
            style={styles.saveBtn}
          >
            Enregistrer les modifications
          </Button>
        </View>
      </KeyboardAvoidingView>

      <OptionPickerDialog
        visible={currencyOpen}
        title="Devise"
        options={CURRENCY_OPTIONS}
        selected={details.devise}
        onSelect={(devise) => update('devise', devise)}
        onDismiss={() => setCurrencyOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerSpacer: { width: 40 },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
  fields: { gap: Spacing.md },
  textArea: { minHeight: 100 },
  mediaSlot: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  mediaImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 2, right: 2, margin: 0 },
  videoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { gap: Spacing.xs },
  currency: { alignSelf: 'center', marginTop: 6, borderRadius: Radius.md },
  currencyContent: { flexDirection: 'row-reverse', height: 52 },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
  },
  detected: {
    gap: 2,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.xs,
  },
  footerError: { textAlign: 'center' },
  saveBtn: { borderRadius: Radius.md },
  saveBtnContent: { height: 52, flexDirection: 'row-reverse' },
});
