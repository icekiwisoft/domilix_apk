import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, View, type TextInput } from 'react-native';

import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { CREATE_TITLE, createStepTotal, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { AppText, Banner, Button, Divider, Field, Screen, StepHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { GeoapifyError, GeoapifyService, type GeoapifyAddressSuggestion } from '@/services/geoapify.service';
import { useCreateListingStore } from '@/stores/create-listing.store';

export default function CreateStep3Screen() {
  const router = useRouter();
  const { draft, setDraft } = useCreateListingStore();
  const total = createStepTotal(draft.type);
  const [locating, setLocating] = useState(false);
  // Shown under the GPS button; `openSettings` when the permission can only be
  // granted from the system settings (Android "Ne plus demander").
  const [locationError, setLocationError] = useState<{ message: string; openSettings?: boolean } | null>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const canContinue = !!draft.address && !!draft.city && !!draft.description;

  function applyLocation(suggestion: GeoapifyAddressSuggestion) {
    setLocationError(null);
    setDraft({
      address: suggestion.text || suggestion.place_name,
      city: suggestion.city || draft.city,
      state: suggestion.state || '',
      country: suggestion.country || draft.country,
      postal_code: suggestion.postal_code || '',
      neighborhood: suggestion.neighborhood || '',
      longitude: suggestion.center[0],
      latitude: suggestion.center[1],
      location_source: 'auto',
      hide_on_map: false,
    });
  }

  function applyCity(suggestion: GeoapifyAddressSuggestion) {
    setLocationError(null);
    setDraft({
      city: suggestion.city || suggestion.text || suggestion.place_name,
      state: suggestion.state || '',
      country: suggestion.country || draft.country,
      longitude: suggestion.center[0],
      latitude: suggestion.center[1],
      location_source: 'auto',
      hide_on_map: false,
    });
  }

  async function useMyLocation() {
    setLocating(true);
    setLocationError(null);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(
          canAskAgain
            ? { message: "Accès à la position refusé. Saisissez l'adresse manuellement ou réessayez." }
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

      applyLocation(await GeoapifyService.reverseGeocode(coords.longitude, coords.latitude));
    } catch (err) {
      setLocationError({
        message:
          err instanceof GeoapifyError
            ? err.message
            : "Impossible de récupérer votre adresse. Réessayez ou saisissez l'adresse manuellement.",
      });
    } finally {
      setLocating(false);
    }
  }

  function handleNext() {
    if (!canContinue) return;
    router.push(draft.type === 'realestate' ? '/announces/create/step-4' : '/announces/create/step-5');
  }

  return (
    <Screen
      keyboard
      header={<StepHeader title={CREATE_TITLE} step={3} total={total} onBack={() => router.back()} />}
      footer={
        <StepFooter
          onPrevious={() => router.back()}
          onNext={handleNext}
          disabled={!canContinue}
          hint="Indiquez l'adresse, la ville et une description pour continuer."
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro title="Localisation" description="Utilisez votre position ou saisissez l'adresse de votre bien." />

      <View style={{ gap: Spacing.sm }}>
        <Button
          variant="secondary"
          size="lg"
          icon="my-location"
          label={locating ? 'Localisation en cours…' : 'Utiliser ma position actuelle'}
          loading={locating}
          onPress={useMyLocation}
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
      </View>

      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}
      >
        <Divider style={{ flex: 1 }} />
        <AppText variant="caption" color="onSurfaceVariant">
          ou saisir manuellement
        </AppText>
        <Divider style={{ flex: 1 }} />
      </View>

      <View style={{ gap: Spacing.sm }}>
        <AddressAutocomplete
          value={draft.address}
          onChange={(v) => {
            // Typing the address manually answers the GPS error banner.
            setLocationError(null);
            setDraft({
              address: v,
              longitude: undefined,
              latitude: undefined,
              location_source: 'manual',
              hide_on_map: true,
            });
          }}
          onSelect={applyLocation}
          onSubmitEditing={() => cityRef.current?.focus()}
        />
        {draft.latitude != null && draft.longitude != null ? (
          <Banner tone="success" icon="my-location">
            Position précise enregistrée pour cette annonce.
          </Banner>
        ) : null}
      </View>

      <AddressAutocomplete
        ref={cityRef}
        kind="city"
        value={draft.city}
        onChange={(city) =>
          setDraft({
            city,
            longitude: undefined,
            latitude: undefined,
            location_source: 'manual',
            hide_on_map: true,
          })
        }
        onSelect={applyCity}
        onSubmitEditing={() => stateRef.current?.focus()}
      />

      <Field
        ref={stateRef}
        label="Région"
        labelHint="(facultatif)"
        value={draft.state}
        onChangeText={(t) => setDraft({ state: t })}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => descriptionRef.current?.focus()}
      />

      <Field
        ref={descriptionRef}
        label="Description"
        value={draft.description}
        onChangeText={(t) => setDraft({ description: t })}
        placeholder="Décrivez votre bien : état, atouts, équipements..."
        multiline
        numberOfLines={5}
      />
    </Screen>
  );
}
