import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { MediaPickerGrid } from '@/components/forms/media-picker-grid';
import { CREATE_STEPS, CREATE_TITLE, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { AppText, Banner, Button, Card, Field, Screen, SegmentedControl, StepHeader, useToast } from '@/components/ui';
import { MAX_MEDIAS } from '@/constants/listing';
import { Spacing } from '@/constants/theme';
import { GeoapifyError, GeoapifyService, type GeoapifyAddressSuggestion } from '@/services/geoapify.service';
import { useCreateListingStore } from '@/stores/create-listing.store';

const MODE_OPTIONS = [
  { value: 'auto' as const, label: 'Position exacte' },
  { value: 'manual' as const, label: 'Adresse manuelle' },
];

function parseCoordinate(text: string, limit: number): number | undefined {
  const value = Number.parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : undefined;
}

function Heading({ children }: { children: string }) {
  return (
    <AppText variant="bodyStrong" accessibilityRole="header">
      {children}
    </AppText>
  );
}

export default function CreateStep3Screen() {
  const router = useRouter();
  const toast = useToast();
  const { draft, setDraft } = useCreateListingStore();
  const isManual = draft.location_source === 'manual';

  const [locating, setLocating] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState(false);
  const [longitudeText, setLongitudeText] = useState('');
  const [latitudeText, setLatitudeText] = useState('');
  // Shown under the GPS button; `openSettings` when the permission can only be
  // granted from the system settings (Android "Ne plus demander").
  const [locationError, setLocationError] = useState<{ message: string; openSettings?: boolean } | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const hasCoordinates = draft.longitude != null && draft.latitude != null;
  const detectedLines = [draft.address, draft.neighbourhood, draft.city, draft.state, draft.country].filter(Boolean);

  function setMode(mode: 'auto' | 'manual') {
    setError('');
    setLocationError(null);
    setDraft({ location_source: mode, hide_on_map: mode === 'manual' });
  }

  function applyPlace(place: GeoapifyAddressSuggestion) {
    const [longitude, latitude] = place.center;
    setLongitudeText(String(longitude));
    setLatitudeText(String(latitude));
    setError('');
    setLocationError(null);
    setDraft({
      location_source: 'auto',
      hide_on_map: false,
      longitude,
      latitude,
      address: place.text || place.place_name,
      neighbourhood: place.neighborhood ?? '',
      city: place.city ?? '',
      state: place.state ?? '',
      country: place.country ?? '',
      zip: place.postal_code ?? '',
    });
  }

  async function detectAddress(longitude: number, latitude: number) {
    try {
      applyPlace(await GeoapifyService.reverseGeocode(longitude, latitude));
    } catch (err) {
      // The coordinates stay valid: the backend resolves the address on publish.
      setLocationError({
        message:
          err instanceof GeoapifyError ? err.message : "Impossible de détecter l'adresse pour ces coordonnées.",
      });
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
            ? { message: "Accès à la position refusé. Recherchez l'adresse, saisissez les coordonnées ou réessayez." }
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
          message:
            "Position introuvable. Vérifiez que la localisation du téléphone est activée ou saisissez l'adresse manuellement.",
        });
        return;
      }
      setDraft({ location_source: 'auto', hide_on_map: false, longitude: coords.longitude, latitude: coords.latitude });
      setLongitudeText(String(coords.longitude));
      setLatitudeText(String(coords.latitude));
      await detectAddress(coords.longitude, coords.latitude);
    } finally {
      setLocating(false);
    }
  }

  function handleManualCoordinates(nextLongitude: string, nextLatitude: string) {
    setLongitudeText(nextLongitude);
    setLatitudeText(nextLatitude);
    setDraft({
      longitude: parseCoordinate(nextLongitude, 180),
      latitude: parseCoordinate(nextLatitude, 90),
    });
  }

  function validate(): string {
    if (isManual && !draft.address.trim() && !draft.neighbourhood.trim() && !draft.city.trim()) {
      return 'Veuillez saisir au moins une adresse, un repère, un quartier ou une ville.';
    }
    if (!isManual && !hasCoordinates) {
      return 'Veuillez utiliser votre position actuelle ou saisir la longitude et la latitude.';
    }
    if (draft.medias.length === 0) return 'Veuillez ajouter au moins une photo ou une vidéo.';
    return '';
  }

  function handleNext() {
    const message = validate();
    setError(message);
    // The banner stays at the end of the page; the toast is seen wherever it is scrolled.
    if (message) toast.show(message, 'error');
    else router.push('/announces/create/step-4');
  }

  return (
    <Screen
      keyboard
      header={<StepHeader title={CREATE_TITLE} step={3} total={CREATE_STEPS} onBack={() => router.back()} />}
      footer={<StepFooter onPrevious={() => router.back()} onNext={handleNext} />}
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro
        title="Localisation & photos"
        description="Ajoutez le repère du bien et les médias qui donnent envie de le visiter."
      />

      <View style={{ gap: Spacing.ms }}>
        <Heading>Localisation</Heading>
        <SegmentedControl
          label="Mode de localisation"
          options={MODE_OPTIONS}
          value={isManual ? 'manual' : 'auto'}
          onChange={setMode}
        />

        {isManual ? (
          <>
            <AppText color="onSurfaceVariant">
              {"Idéal si le bien se repère par quartier, carrefour ou lieu connu. Dans ce mode, l'annonce ne sera pas affichée sur la carte."}
            </AppText>
            <Field
              label="Adresse ou repère"
              placeholder="Ex. Bonamoussadi, près du carrefour Maetur"
              value={draft.address}
              onChangeText={(address) => setDraft({ address })}
            />
            <Field
              label="Quartier"
              placeholder="Ex. Bonamoussadi"
              value={draft.neighbourhood}
              onChangeText={(neighbourhood) => setDraft({ neighbourhood })}
            />
            <Field
              label="Ville"
              placeholder="Ex. Douala"
              value={draft.city}
              onChangeText={(city) => setDraft({ city })}
            />
            <Banner icon="visibility-off">Ne pas afficher sur la carte</Banner>
          </>
        ) : (
          <>
            <AppText color="onSurfaceVariant">
              {"Utilisez votre position actuelle, recherchez une adresse ou entrez longitude puis latitude. Domilix remplira l'adresse automatiquement."}
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

            <AddressAutocomplete
              label="Rechercher une adresse"
              value={search}
              onChange={setSearch}
              onSelect={(place) => {
                applyPlace(place);
                setSearch('');
              }}
            />

            <Button
              variant="text"
              icon={manualCoordinates ? 'expand-less' : 'edit-location-alt'}
              label={manualCoordinates ? 'Masquer les coordonnées' : 'Saisir les coordonnées'}
              accessibilityState={{ expanded: manualCoordinates }}
              onPress={() => setManualCoordinates((v) => !v)}
              style={{ alignSelf: 'flex-start' }}
            />

            {manualCoordinates || hasCoordinates ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
                <Field
                  label="Longitude"
                  value={longitudeText || (draft.longitude != null ? String(draft.longitude) : '')}
                  onChangeText={(t) => handleManualCoordinates(t, latitudeText)}
                  editable={manualCoordinates}
                  keyboardType="numbers-and-punctuation"
                  containerStyle={{ flexGrow: 1, flexBasis: '40%' }}
                />
                <Field
                  label="Latitude"
                  value={latitudeText || (draft.latitude != null ? String(draft.latitude) : '')}
                  onChangeText={(t) => handleManualCoordinates(longitudeText, t)}
                  onEndEditing={() => {
                    if (manualCoordinates && draft.longitude != null && draft.latitude != null) {
                      detectAddress(draft.longitude, draft.latitude);
                    }
                  }}
                  editable={manualCoordinates}
                  keyboardType="numbers-and-punctuation"
                  containerStyle={{ flexGrow: 1, flexBasis: '40%' }}
                />
              </View>
            ) : null}

            {hasCoordinates && detectedLines.length > 0 ? (
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
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Heading>Photos et vidéos</Heading>
        <AppText variant="caption" color="onSurfaceVariant">
          {`Images ou vidéos, ${MAX_MEDIAS} maximum. Plus vous en ajoutez, plus votre annonce inspire confiance.`}
        </AppText>
        <MediaPickerGrid
          medias={draft.medias}
          onChange={(medias) => {
            setError('');
            setDraft({ medias });
          }}
        />
      </View>

      {error ? (
        <Banner tone="error" style={{ marginBottom: Spacing.sm }}>
          {error}
        </Banner>
      ) : null}
    </Screen>
  );
}
