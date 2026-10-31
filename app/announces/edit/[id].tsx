import { usePreventRemove } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Linking, View } from 'react-native';

import { CategoryPicker } from '@/components/forms/category-picker';
import { AmenityPicker, StandingPicker } from '@/components/forms/listing-features';
import {
  AD_TYPE_OPTIONS,
  deviseLabel,
  EDIT_AMENITY_OPTIONS,
  MAX_ROOMS,
  TYPE_LABELS,
  type AmenityKey,
} from '@/components/forms/listing-options';
import { MediaPickerGrid } from '@/components/forms/media-picker-grid';
import { PhotoGrid, PhotoTile } from '@/components/forms/media-upload-grid';
import { OptionPickerDialog } from '@/components/forms/option-picker-dialog';
import { SendProgress, StepFooter } from '@/components/forms/step-layout';
import {
  AppText,
  Banner,
  Button,
  Card,
  Chip,
  ChipGroup,
  Dialog,
  ErrorState,
  Field,
  LoadingState,
  OfflineState,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Stepper,
  useToast,
} from '@/components/ui';
import { CURRENCY_OPTIONS, LAND_USE_OPTIONS, MAX_MEDIAS, PERIOD_OPTIONS, currencyLabel } from '@/constants/listing';
import { Spacing } from '@/constants/theme';
import { useAnnounce, useUpdateAnnounce, type UploadProgress } from '@/hooks/queries/use-announces';
import { getApiErrorMessage } from '@/lib/api-error';
import { decimalOnly, digitsOnly } from '@/lib/digits';
import { isNetworkError } from '@/lib/network-error';
import {
  buildUpdatePayload,
  getEditAmenities,
  getEditDetails,
  readableAmenityKeys,
  toText,
  type EditDetails,
} from '@/lib/listing-payload';
import { GeoapifyError, GeoapifyService } from '@/services/geoapify.service';
import type { PickedMedia } from '@/services/uploads.service';

// Same fields as the website's edit dialog (domilix.com EditAdModal.tsx).

const TITLE = "Modifier l'annonce";

const CONDITION_OPTIONS = [
  { value: 'used' as const, label: 'Occasion' },
  { value: 'new' as const, label: 'Neuf' },
];

const EDIT_PERIOD_OPTIONS = [{ value: '', label: 'Non précisée' }, ...PERIOD_OPTIONS];

const MODE_OPTIONS = [
  { value: 'auto' as const, label: 'Position exacte' },
  { value: 'manual' as const, label: 'Adresse manuelle' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card surface="surfaceContainerLowest" outlined style={{ gap: Spacing.md }}>
      <AppText variant="bodyStrong" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </Card>
  );
}

function Label({ children }: { children: string }) {
  return (
    <AppText variant="label" color="onSurfaceVariant">
      {children}
    </AppText>
  );
}

export default function EditAnnounceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const { data: announce, isLoading, isError, error: loadError, refetch } = useAnnounce(id);
  const updateAnnounce = useUpdateAnnounce();

  const [details, setDetails] = useState<EditDetails | null>(null);
  const [amenities, setAmenities] = useState<Record<AmenityKey, boolean> | null>(null);
  const [manualAddress, setManualAddress] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [coordinates, setCoordinates] = useState({ longitude: '', latitude: '' });
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [newMedias, setNewMedias] = useState<PickedMedia[]>([]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<{ message: string; openSettings?: boolean } | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState('');
  // Busy from the tap until the server answers, uploads included (QA-33).
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const saving = sending || updateAnnounce.isPending;

  // Pre-populate once the listing has loaded, and keep a snapshot to detect unsaved changes.
  const initialized = useRef(false);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);
  useEffect(() => {
    if (!announce || initialized.current) return;
    initialized.current = true;
    const initialDetails = getEditDetails(announce);
    const initialAmenities = getEditAmenities(announce);
    const initialManual = announce.location_source === 'manual';
    const initialCoordinates = { longitude: toText(announce.longitude), latitude: toText(announce.latitude) };
    setDetails(initialDetails);
    setAmenities(initialAmenities);
    setManualAddress(initialManual);
    setCoordinates(initialCoordinates);
    setShowCoordinates(announce.longitude != null && announce.latitude != null);
    setInitialSnapshot(
      JSON.stringify([initialDetails, initialAmenities, initialManual, initialCoordinates, [], []])
    );
  }, [announce]);

  const dirty =
    initialSnapshot !== null &&
    JSON.stringify([
      details,
      amenities,
      manualAddress,
      coordinates,
      removedMediaIds,
      newMedias.map((m) => m.uri),
    ]) !== initialSnapshot;

  // Back arrow, Android back or swipe with unsaved changes: ask first.
  const navigation = useNavigation();
  const allowLeave = useRef(false);
  const [pendingLeave, setPendingLeave] = useState<Parameters<typeof navigation.dispatch>[0] | null>(null);
  usePreventRemove(dirty, ({ data }) => {
    if (allowLeave.current) navigation.dispatch(data.action);
    else setPendingLeave(data.action);
  });

  const isLand = announce?.type === 'land';
  const isRealestate = announce?.type === 'realestate';

  const existingMedias = (announce?.medias ?? []).filter((m) => !removedMediaIds.includes(String(m.id)));
  const totalMedias = existingMedias.length + newMedias.length;

  function update<K extends keyof EditDetails>(key: K, value: EditDetails[K]) {
    setDetails((current) => (current ? { ...current, [key]: value } : current));
  }

  function toggleAmenity(key: AmenityKey) {
    setAmenities((current) => (current ? { ...current, [key]: !current[key] } : current));
  }

  function setMode(mode: 'auto' | 'manual') {
    const manual = mode === 'manual';
    setManualAddress(manual);
    setError('');
    setLocationError(null);
    if (manual) {
      setCoordinates({ longitude: '', latitude: '' });
      setShowCoordinates(false);
    }
  }

  async function useCurrentPosition() {
    setLocating(true);
    setError('');
    setLocationError(null);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(
          canAskAgain
            ? { message: 'Accès à la position refusé. Saisissez les coordonnées ou réessayez.' }
            : {
                message:
                  "L'accès à la position est bloqué pour Domilix. Autorisez-le dans les réglages ou saisissez l'adresse manuellement.",
                openSettings: true,
              }
        );
        return;
      }
      let coords: Location.LocationObjectCoords;
      try {
        coords = (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;
      } catch {
        setLocationError({
          message: "Position introuvable. Vérifiez que la localisation du téléphone est activée.",
        });
        return;
      }
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
      } catch (err) {
        // The backend resolves the address from the coordinates on save.
        if (err instanceof GeoapifyError) setLocationError({ message: err.message });
      }
    } finally {
      setLocating(false);
    }
  }

  function fail(message: string) {
    setError(message);
    toast.show(message, 'error');
  }

  function handleSave() {
    if (!details || !amenities || !announce || saving || sendingRef.current) return;

    const longitude = Number.parseFloat(coordinates.longitude.replace(',', '.'));
    const latitude = Number.parseFloat(coordinates.latitude.replace(',', '.'));
    const hasCoordinates = Number.isFinite(longitude) && Number.isFinite(latitude);

    if (!details.description.trim() || !details.price.trim()) {
      fail('La description et le prix sont obligatoires.');
      return;
    }
    if (hasCoordinates && (Math.abs(longitude) > 180 || Math.abs(latitude) > 90)) {
      fail('Coordonnées GPS invalides.');
      return;
    }
    if (manualAddress && !details.address.trim() && !details.neighbourhood.trim() && !details.city.trim()) {
      fail('Veuillez saisir au moins une adresse, un repère, un quartier ou une ville.');
      return;
    }
    if (totalMedias === 0) {
      fail('Veuillez ajouter au moins une photo ou une vidéo.');
      return;
    }
    setError('');

    const payload = buildUpdatePayload(
      announce.type,
      details,
      amenities,
      { manualAddress, coordinates: hasCoordinates ? { longitude, latitude } : null },
      readableAmenityKeys(announce)
    );

    // The API replaces the ad's media with `media_ids`: keep the ones that were
    // not removed, the new ones are uploaded by the hook first.
    const keepMediaIds = existingMedias.map((m) => String(m.id));
    sendingRef.current = true;
    setSending(true);
    setProgress(null);

    updateAnnounce.mutate(
      { id, payload, newMedia: newMedias, keepMediaIds, onProgress: setProgress },
      {
        onSettled: () => {
          sendingRef.current = false;
          setSending(false);
        },
        onSuccess: () => {
          toast.show('Annonce mise à jour.', 'success');
          allowLeave.current = true;
          router.back();
        },
        onError: (e) => {
          setProgress(null);
          fail(
            isNetworkError(e)
              ? "Pas de connexion internet. L'annonce n'a pas été modifiée, réessayez."
              : getApiErrorMessage(e, 'Erreur lors de la mise à jour.')
          );
        },
      }
    );
  }

  const header = <ScreenHeader title={TITLE} onBack={() => router.back()} />;

  if (isLoading || (announce && (!details || !amenities))) {
    return (
      <Screen header={header}>
        <LoadingState label="Chargement de l'annonce…" media={false} count={3} />
      </Screen>
    );
  }

  // Without the listing the form would start empty: never offer to save it.
  if (!announce || !details || !amenities) {
    return (
      <Screen header={header} contentStyle={{ flexGrow: 1 }}>
        {isError && isNetworkError(loadError) ? (
          <OfflineState onRetry={() => refetch()} />
        ) : (
          <ErrorState title="Impossible de charger l'annonce" onRetry={() => refetch()} />
        )}
      </Screen>
    );
  }

  const isLocation = details.ad_type === 'location';
  const hasCoordinates = !!coordinates.longitude && !!coordinates.latitude;
  const detectedLines = [details.address, details.neighbourhood, details.city, details.state, details.country].filter(
    Boolean
  );

  return (
    <Screen
      keyboard
      header={header}
      footer={
        <StepFooter
          label={saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          status={saving ? <SendProgress progress={progress} saveLabel="Enregistrement des modifications…" /> : null}
          icon="check-circle"
          onNext={handleSave}
          loading={saving}
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      {/* The backend keeps the property type of a listing (the website does not offer to change it). */}
      <Banner icon={TYPE_LABELS[announce.type].icon}>{`Annonce : ${TYPE_LABELS[announce.type].label}`}</Banner>

      {error ? <Banner tone="error">{error}</Banner> : null}

      <Section title="Essentiel">
        <Field
          label="Description"
          value={details.description}
          onChangeText={(t) => update('description', t)}
          placeholder="Décrivez votre bien..."
          multiline
          numberOfLines={5}
        />
        {!isLand ? (
          <CategoryPicker type={announce.type} value={details.category_id} onChange={(v) => update('category_id', v)} />
        ) : null}
        <View style={{ gap: Spacing.sm }}>
          <Label>{"Type d'annonce"}</Label>
          <SegmentedControl
            label="Type d'annonce"
            options={AD_TYPE_OPTIONS}
            value={details.ad_type}
            onChange={(v) => update('ad_type', v)}
          />
        </View>
        <Field
          label="Téléphone à afficher"
          labelHint="(facultatif)"
          helper="Sinon, le téléphone de votre profil annonceur."
          value={details.contact_phone}
          onChangeText={(t) => update('contact_phone', t)}
          keyboardType="phone-pad"
        />
        <Field
          label="Email à afficher"
          labelHint="(facultatif)"
          helper="Sinon, l'email de votre profil."
          value={details.contact_email}
          onChangeText={(t) => update('contact_email', t)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Section>

      <Section title={`Médias (${totalMedias})`}>
        {existingMedias.length > 0 ? (
          <PhotoGrid>
            {existingMedias.map((media, i) => {
              const isVideo = (media.type ?? '').startsWith('video');
              return (
                <PhotoTile
                  key={media.id}
                  uri={isVideo ? media.thumbnail : (media.thumbnail ?? media.file)}
                  video={isVideo}
                  label={`${isVideo ? 'Vidéo' : 'Photo'} ${i + 1}`}
                  badge={i === 0 ? 'Principale' : undefined}
                  onRemove={saving ? undefined : () => setRemovedMediaIds((prev) => [...prev, String(media.id)])}
                />
              );
            })}
          </PhotoGrid>
        ) : null}
        <MediaPickerGrid
          medias={newMedias}
          onChange={(medias) => {
            setError('');
            setNewMedias(medias);
          }}
          max={Math.max(MAX_MEDIAS - existingMedias.length, 0)}
          mainMedia={false}
          offset={existingMedias.length}
          disabled={saving}
        />
        {removedMediaIds.length > 0 ? (
          <Banner
            icon="delete-outline"
            action={
              <Button
                variant="text"
                icon="undo"
                label="Annuler la suppression"
                onPress={() => setRemovedMediaIds([])}
                style={{ alignSelf: 'flex-start' }}
              />
            }
          >
            {`${removedMediaIds.length} média${removedMediaIds.length > 1 ? 's' : ''} supprimé${removedMediaIds.length > 1 ? 's' : ''} à l'enregistrement.`}
          </Banner>
        ) : null}
      </Section>

      <Section title="Prix et disponibilité">
        <Field
          label="Prix"
          value={details.price}
          onChangeText={(t) => update('price', digitsOnly(t))}
          keyboardType="number-pad"
          suffix={deviseLabel(details.devise)}
        />
        <Button
          variant="secondary"
          icon="expand-more"
          label={`Devise : ${currencyLabel(details.devise)}`}
          onPress={() => setCurrencyOpen(true)}
          style={{ alignSelf: 'flex-start' }}
        />
        {isLocation ? (
          <View style={{ gap: Spacing.sm }}>
            <Label>Période</Label>
            <ChipGroup
              label="Période"
              options={EDIT_PERIOD_OPTIONS}
              value={details.period}
              onChange={(v) => update('period', v)}
            />
          </View>
        ) : null}
      </Section>

      <Section title="Localisation">
        <SegmentedControl
          label="Mode de localisation"
          options={MODE_OPTIONS}
          value={manualAddress ? 'manual' : 'auto'}
          onChange={setMode}
        />
        {manualAddress ? (
          <>
            <AppText color="onSurfaceVariant">
              {"Idéal si le bien se repère par quartier, carrefour ou lieu connu. Dans ce mode, l'annonce ne sera pas affichée sur la carte."}
            </AppText>
            <Field label="Adresse ou repère" value={details.address} onChangeText={(t) => update('address', t)} />
            <Field label="Quartier" value={details.neighbourhood} onChangeText={(t) => update('neighbourhood', t)} />
            <Field label="Ville" value={details.city} onChangeText={(t) => update('city', t)} />
            <Field label="Pays" value={details.country} onChangeText={(t) => update('country', t)} />
          </>
        ) : (
          <>
            <AppText color="onSurfaceVariant">
              {"Utilisez votre position actuelle ou entrez longitude puis latitude. Domilix remplira l'adresse automatiquement."}
            </AppText>
            <Button
              variant="secondary"
              size="lg"
              icon="my-location"
              label={locating ? 'Localisation en cours…' : 'Utiliser ma position actuelle'}
              loading={locating}
              onPress={useCurrentPosition}
              fullWidth
            />
            {locationError ? (
              <Banner
                tone="error"
                action={
                  locationError.openSettings ? (
                    <Button
                      variant="text"
                      icon="settings"
                      label="Ouvrir les réglages"
                      onPress={() => Linking.openSettings()}
                      style={{ alignSelf: 'flex-start' }}
                    />
                  ) : undefined
                }
              >
                {locationError.message}
              </Banner>
            ) : null}
            <Button
              variant="text"
              icon={showCoordinates ? 'expand-less' : 'edit-location-alt'}
              label={showCoordinates ? 'Masquer les coordonnées' : 'Saisir les coordonnées'}
              accessibilityState={{ expanded: showCoordinates }}
              onPress={() => setShowCoordinates((v) => !v)}
              style={{ alignSelf: 'flex-start' }}
            />
            {showCoordinates || hasCoordinates ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
                <Field
                  label="Longitude"
                  value={coordinates.longitude}
                  onChangeText={(t) => setCoordinates((c) => ({ ...c, longitude: t }))}
                  keyboardType="numbers-and-punctuation"
                  containerStyle={{ flexGrow: 1, flexBasis: '40%' }}
                />
                <Field
                  label="Latitude"
                  value={coordinates.latitude}
                  onChangeText={(t) => setCoordinates((c) => ({ ...c, latitude: t }))}
                  keyboardType="numbers-and-punctuation"
                  containerStyle={{ flexGrow: 1, flexBasis: '40%' }}
                />
              </View>
            ) : null}
            {detectedLines.length > 0 ? (
              <Card surface="surfaceContainerLow" outlined style={{ gap: Spacing.xs }}>
                <AppText variant="label" color="onSurfaceVariant" accessibilityRole="header">
                  Lieu détecté
                </AppText>
                {detectedLines.map((line) => (
                  <AppText key={line}>{line}</AppText>
                ))}
              </Card>
            ) : null}
          </>
        )}
      </Section>

      {isLand ? (
        <Section title="Caractéristiques du terrain">
          <Field
            label="Surface"
            value={details.size}
            onChangeText={(t) => update('size', digitsOnly(t))}
            keyboardType="number-pad"
            suffix="m²"
          />
          <View style={{ gap: Spacing.sm }}>
            <Label>Usage</Label>
            <ChipGroup
              label="Usage"
              options={LAND_USE_OPTIONS}
              value={details.land_use}
              onChange={(v) => update('land_use', v)}
            />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            <Chip
              label="Titre foncier"
              icon="verified-user"
              selected={details.land_title}
              onPress={() => update('land_title', !details.land_title)}
            />
            <Chip label="Clôturé" icon="lock" selected={amenities.gate} onPress={() => toggleAmenity('gate')} />
          </View>
        </Section>
      ) : null}

      {isRealestate ? (
        <Section title="Caractéristiques immobilier">
          <Stepper
            label="Chambres"
            helper="0 pour un studio"
            value={details.bedroom}
            onChange={(v) => update('bedroom', v)}
            min={0}
            // A listing created on the website may have more rooms than offered here.
            max={Math.max(MAX_ROOMS, announce.bedroom ?? 0)}
          />
          <Stepper
            label="Salons"
            value={details.mainroom}
            onChange={(v) => update('mainroom', v)}
            min={0}
            max={Math.max(MAX_ROOMS, announce.mainroom ?? 0)}
          />
          <Stepper
            label="Toilettes"
            value={details.toilet}
            onChange={(v) => update('toilet', v)}
            min={0}
            max={Math.max(MAX_ROOMS, announce.toilet ?? 0)}
          />
          <Stepper
            label="Cuisines"
            value={details.kitchen}
            onChange={(v) => update('kitchen', v)}
            min={0}
            max={Math.max(MAX_ROOMS, announce.kitchen ?? 0)}
          />
          <Field
            label="Caution"
            labelHint="(facultatif)"
            value={details.caution}
            onChangeText={(t) => update('caution', digitsOnly(t))}
            keyboardType="number-pad"
            suffix={deviseLabel(details.devise)}
          />
          <Field
            label="Surface"
            labelHint="(facultatif)"
            value={details.size}
            onChangeText={(t) => update('size', digitsOnly(t))}
            keyboardType="number-pad"
            suffix="m²"
          />
          <StandingPicker value={details.standing} onChange={(v) => update('standing', v)} />
          <AmenityPicker value={amenities} onToggle={toggleAmenity} options={EDIT_AMENITY_OPTIONS} />
        </Section>
      ) : null}

      {!isLand && !isRealestate ? (
        <Section title="Dimensions mobilier">
          <View style={{ gap: Spacing.sm }}>
            <Label>État</Label>
            <SegmentedControl
              label="État"
              options={CONDITION_OPTIONS}
              value={details.condition}
              onChange={(v) => update('condition', v)}
            />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
            {(['height', 'width', 'length', 'weight'] as const).map((key) => (
              <Field
                key={key}
                label={{ height: 'Hauteur', width: 'Largeur', length: 'Longueur', weight: 'Poids' }[key]}
                value={details[key]}
                onChangeText={(t) => update(key, decimalOnly(t))}
                keyboardType="decimal-pad"
                containerStyle={{ flexGrow: 1, flexBasis: '40%' }}
              />
            ))}
          </View>
        </Section>
      ) : null}

      <OptionPickerDialog
        visible={currencyOpen}
        title="Devise"
        options={CURRENCY_OPTIONS}
        selected={details.devise}
        onSelect={(devise) => update('devise', devise)}
        onDismiss={() => setCurrencyOpen(false)}
      />
      <Dialog
        visible={pendingLeave !== null}
        title="Quitter sans enregistrer ?"
        message="Vos modifications de l'annonce seront perdues."
        confirmLabel="Quitter"
        cancelLabel="Continuer la modification"
        danger
        onConfirm={() => {
          const action = pendingLeave;
          setPendingLeave(null);
          allowLeave.current = true;
          if (action) navigation.dispatch(action);
        }}
        onCancel={() => setPendingLeave(null)}
      />
    </Screen>
  );
}
