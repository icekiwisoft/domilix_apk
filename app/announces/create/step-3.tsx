import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Chip, TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateListingStore } from '@/stores/create-listing.store';
import { AddressesService } from '@/services/addresses.service';

const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Limbé'];

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
      const result = await AddressesService.reverseGeocode(loc.coords.longitude, loc.coords.latitude);
      const parts = result.place_name.split(', ');
      setDraft({
        address: result.text || parts[0] || '',
        city: parts.length > 1 ? parts[1] : draft.city,
        state: parts.length > 2 ? parts[2] : '',
      });
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
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
          Localisation & Description
        </Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs, marginBottom: Spacing.xl }]}>
          Utilisez votre position ou saisissez l'adresse de votre bien.
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
            onChange={(v) => setDraft({ address: v })}
          />
        </View>

        {/* City */}
        <View style={[styles.section, { marginTop: Spacing.lg }]}>
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
                  style={{ backgroundColor: active ? C.primary : C.surfaceContainer }}
                  textStyle={{ color: active ? C.onPrimary : C.onSurface }}
                >
                  {city}
                </Chip>
              );
            })}
          </View>
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
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  textArea: {
    minHeight: 100,
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
