import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { SectionLabel, StepTitle, WizardFooter, wizardStyles } from '@/components/forms/create-step-parts';
import { MediaPickerGrid } from '@/components/forms/media-picker-grid';
import { MAX_MEDIAS } from '@/constants/listing';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GeoapifyService, type GeoapifyAddressSuggestion } from '@/services/geoapify.service';
import { useCreateListingStore } from '@/stores/create-listing.store';

function parseCoordinate(text: string, limit: number): number | undefined {
  const value = Number.parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : undefined;
}

export default function CreateStep3Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft } = useCreateListingStore();
  const isManual = draft.location_source === 'manual';

  const [locating, setLocating] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState(false);
  const [longitudeText, setLongitudeText] = useState('');
  const [latitudeText, setLatitudeText] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const hasCoordinates = draft.longitude != null && draft.latitude != null;
  const detectedLines = [draft.address, draft.neighbourhood, draft.city, draft.state, draft.country].filter(Boolean);

  function setMode(manual: boolean) {
    setError('');
    setDraft({ location_source: manual ? 'manual' : 'auto', hide_on_map: manual });
  }

  function applyPlace(place: GeoapifyAddressSuggestion) {
    const [longitude, latitude] = place.center;
    setLongitudeText(String(longitude));
    setLatitudeText(String(latitude));
    setError('');
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
    } catch {
      // The coordinates stay valid: the backend resolves the address on publish.
      setError("Impossible de détecter l'adresse pour ces coordonnées.");
    }
  }

  async function useCurrentPosition() {
    setLocating(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          "Autorisez l'accès à la localisation dans les paramètres de votre téléphone pour utiliser cette fonctionnalité."
        );
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setDraft({ location_source: 'auto', hide_on_map: false, longitude: coords.longitude, latitude: coords.latitude });
      setLongitudeText(String(coords.longitude));
      setLatitudeText(String(coords.latitude));
      await detectAddress(coords.longitude, coords.latitude);
    } catch {
      setError("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.");
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
    if (!message) router.push('/announces/create/step-4');
  }

  return (
    <SafeAreaView style={[wizardStyles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={3} total={4} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={wizardStyles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepTitle
          title="Localisation & photos"
          subtitle="Ajoutez le repère du bien et les médias qui donnent envie de le visiter."
        />

        <View style={styles.block}>
          <SectionLabel>Localisation</SectionLabel>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: isManual }}
            onPress={() => setMode(!isManual)}
            style={[
              styles.modeCard,
              {
                borderColor: isManual ? C.primary : C.outlineVariant,
                backgroundColor: isManual ? C.primary + '10' : C.surfaceContainerLow,
              },
            ]}
          >
            <View style={[styles.modeIcon, { backgroundColor: isManual ? C.primary : C.surfaceContainerHighest }]}>
              <MaterialIcons name="place" size={22} color={isManual ? C.onPrimary : C.onSurfaceVariant} />
            </View>
            <View style={styles.modeText}>
              <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
                {"Entrer l'adresse manuellement"}
              </Text>
              <Text style={[Typography.caption, { color: C.onSurfaceVariant, lineHeight: 18 }]}>
                {"Idéal si le bien se repère par quartier, carrefour ou lieu connu. Dans ce mode, l'annonce ne sera pas affichée sur la carte."}
              </Text>
            </View>
          </Pressable>

          {isManual ? (
            <View style={[styles.panel, { borderColor: C.outlineVariant, backgroundColor: C.surface }]}>
              <TextInput
                mode="outlined"
                label="Adresse ou repère"
                placeholder="Ex: Bonamoussadi, près du carrefour Maetur"
                value={draft.address}
                onChangeText={(address) => setDraft({ address })}
              />
              <TextInput
                mode="outlined"
                label="Quartier"
                placeholder="Ex: Bonamoussadi"
                value={draft.neighbourhood}
                onChangeText={(neighbourhood) => setDraft({ neighbourhood })}
              />
              <TextInput
                mode="outlined"
                label="Ville"
                placeholder="Ex: Douala"
                value={draft.city}
                onChangeText={(city) => setDraft({ city })}
              />
              <View style={[styles.hiddenBadge, { backgroundColor: C.surfaceContainer }]}>
                <MaterialIcons name="visibility-off" size={16} color={C.onSurfaceVariant} />
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>Ne pas afficher sur la carte</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.panel, { borderColor: C.outlineVariant, backgroundColor: C.surface }]}>
              <View>
                <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
                  Position exacte du bien
                </Text>
                <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 2, lineHeight: 18 }]}>
                  {"Utilisez votre position actuelle, recherchez une adresse ou entrez longitude puis latitude. Domilix remplira l'adresse automatiquement."}
                </Text>
              </View>

              <Button
                mode="contained"
                icon={locating ? undefined : 'crosshairs-gps'}
                loading={locating}
                disabled={locating}
                onPress={useCurrentPosition}
              >
                {locating ? 'Récupération...' : 'Position actuelle'}
              </Button>

              <AddressAutocomplete
                value={search}
                onChange={setSearch}
                onSelect={(place) => {
                  applyPlace(place);
                  setSearch('');
                }}
              />

              <Button mode="outlined" onPress={() => setManualCoordinates((v) => !v)}>
                {manualCoordinates ? 'Masquer' : 'Saisie manuelle'}
              </Button>

              {(manualCoordinates || hasCoordinates) && (
                <View style={wizardStyles.row}>
                  <TextInput
                    mode="outlined"
                    label="Longitude"
                    value={longitudeText || (draft.longitude != null ? String(draft.longitude) : '')}
                    onChangeText={(t) => handleManualCoordinates(t, latitudeText)}
                    editable={manualCoordinates}
                    keyboardType="numbers-and-punctuation"
                    style={styles.flex}
                  />
                  <TextInput
                    mode="outlined"
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
                    style={styles.flex}
                  />
                </View>
              )}
            </View>
          )}

          {!isManual && hasCoordinates && detectedLines.length > 0 && (
            <View style={[styles.detected, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
              <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                Lieu détecté
              </Text>
              {detectedLines.map((line) => (
                <Text key={line} style={[Typography.bodyMd, { color: C.onSurface }]}>
                  {line}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.block}>
          <SectionLabel>Photos et vidéos</SectionLabel>
          <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
            {`Images ou vidéos, ${MAX_MEDIAS} maximum.`}
          </Text>
          <MediaPickerGrid
            medias={draft.medias}
            onChange={(medias) => {
              setError('');
              setDraft({ medias });
            }}
          />
        </View>
      </ScrollView>

      <WizardFooter label="Suivant" onPress={handleNext} error={error} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  block: { gap: Spacing.sm },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
  },
  modeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: { flex: 1, gap: 2 },
  panel: {
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  hiddenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  detected: {
    gap: 2,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
});
