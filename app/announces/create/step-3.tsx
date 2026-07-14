import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore } from '@/stores/create-listing.store';
import { GeoapifyService, type GeoapifyAddressSuggestion } from '@/services/geoapify.service';

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
  const { draft, setDraft } = useCreateListingStore();
  const total = draft.type === 'furniture' ? 4 : 5;
  const [locating, setLocating] = useState(false);

  const canContinue = !!draft.address && !!draft.city && !!draft.description;

  function applyLocation(suggestion: GeoapifyAddressSuggestion) {
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
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          "Autorisez l'accès à la localisation dans les paramètres de votre téléphone pour utiliser cette fonctionnalité."
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const result = await GeoapifyService.reverseGeocode(loc.coords.longitude, loc.coords.latitude);
      applyLocation(result);
    } catch {
      Alert.alert('Erreur', 'Impossible de récupérer votre position. Réessayez ou saisissez manuellement.');
    } finally {
      setLocating(false);
    }
  }

  function handleNext() {
    if (!canContinue) return;
    router.push(draft.type === 'realestate' ? '/announces/create/step-4' : '/announces/create/step-5');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={3} total={total} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs, marginBottom: Spacing.xl }]}>
          {"Utilisez votre position ou saisissez l'adresse de votre bien."}
        </Text>

        {/* GPS button */}
        <Button
          mode="outlined"
          icon={locating ? undefined : 'crosshairs-gps'}
          loading={locating}
          onPress={useMyLocation}
          disabled={locating}
        >
          {locating ? 'Localisation en cours…' : 'Utiliser ma position actuelle'}
        </Button>

        <View style={[styles.dividerRow, { marginVertical: Spacing.lg }]}>
          <View style={[styles.dividerLine, { backgroundColor: C.outlineVariant }]} />
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginHorizontal: Spacing.sm }]}>ou saisir manuellement</Text>
          <View style={[styles.dividerLine, { backgroundColor: C.outlineVariant }]} />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <SectionLabel>Adresse</SectionLabel>
          <AddressAutocomplete
            value={draft.address}
            onChange={(v) => setDraft({
              address: v,
              longitude: undefined,
              latitude: undefined,
              location_source: 'manual',
              hide_on_map: true,
            })}
            onSelect={applyLocation}
          />
          {draft.latitude != null && draft.longitude != null && (
            <View style={[styles.locationStatus, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
              <Text style={[Typography.caption, { color: C.onSurface }]}>Position précise enregistrée pour cette annonce.</Text>
            </View>
          )}
        </View>

        {/* City */}
        <View style={[styles.section, { marginTop: Spacing.lg }]}>
          <SectionLabel>Ville</SectionLabel>
          <AddressAutocomplete
            kind="city"
            value={draft.city}
            onChange={(city) => setDraft({
              city,
              longitude: undefined,
              latitude: undefined,
              location_source: 'manual',
              hide_on_map: true,
            })}
            onSelect={applyCity}
          />
        </View>

        {/* State/Region */}
        <View style={[styles.section, { marginTop: Spacing.lg }]}>
          <TextInput
            mode="outlined"
            label="Région / État — optionnel"
            value={draft.state}
            onChangeText={(t) => setDraft({ state: t })}
          />
        </View>

        {/* Description */}
        <View style={[styles.section, { marginTop: Spacing.lg }]}>
          <TextInput
            mode="outlined"
            label="Description"
            value={draft.description}
            onChangeText={(t) => setDraft({ description: t })}
            placeholder="Décrivez votre bien : état, atouts, équipements..."
            multiline
            numberOfLines={5}
            style={styles.textArea}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={!canContinue}
          icon="arrow-right"
          contentStyle={styles.nextBtnContent}
          style={styles.nextBtn}
        >
          Suivant
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
  },
  section: {},
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  textArea: {
    minHeight: 100,
  },
  locationStatus: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  nextBtn: {
    borderRadius: Radius.md,
  },
  nextBtnContent: {
    height: 52,
    flexDirection: 'row-reverse',
  },
});
