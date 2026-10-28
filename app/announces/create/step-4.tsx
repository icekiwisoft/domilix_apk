import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, ProgressBar, TextInput } from 'react-native-paper';
import { CreateStepHeader } from '@/components/forms/create-step-header';
import { ChoiceChip, SectionLabel, StepTitle, WizardFooter, wizardStyles } from '@/components/forms/create-step-parts';
import { OptionPickerDialog } from '@/components/forms/option-picker-dialog';
import { CURRENCY_OPTIONS, PERIOD_OPTIONS, currencyLabel } from '@/constants/listing';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateAnnounce, type UploadProgress } from '@/hooks/queries/use-announces';
import { getApiErrorMessage } from '@/lib/api-error';
import { useCreateListingStore } from '@/stores/create-listing.store';

const TYPE_LABEL = { realestate: 'Immobilier', land: 'Terrain', furniture: 'Mobilier' } as const;
const TYPE_ICON = { realestate: 'home-work', land: 'landscape', furniture: 'chair' } as const;

export default function CreateStep4Screen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { draft, setDraft, resetDraft } = useCreateListingStore();
  const createAnnounce = useCreateAnnounce();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState('');

  const isLocation = draft.ad_type === 'location';
  const canPublish =
    !!draft.description.trim() &&
    !!draft.price.trim() &&
    draft.medias.length > 0 &&
    (draft.type !== 'land' || Number(draft.size) > 0) &&
    (!isLocation || !!draft.period);
  const publishing = createAnnounce.isPending;

  function handlePublish() {
    if (!canPublish || publishing) return;
    setError('');
    createAnnounce.mutate(
      { draft, onProgress: setProgress },
      {
        onSuccess: () => {
          resetDraft();
          router.replace('/profile/my-listings');
        },
        onError: (e) => {
          setProgress(null);
          setError(getApiErrorMessage(e, "Impossible de publier l'annonce. Vérifiez votre connexion et réessayez."));
        },
      }
    );
  }

  const place = draft.city || draft.neighbourhood || draft.address;

  return (
    <SafeAreaView style={[wizardStyles.safe, { backgroundColor: C.background }]}>
      <CreateStepHeader step={4} total={4} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={wizardStyles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepTitle title="Prix & description" subtitle="Dernière étape avant la publication de votre annonce." />

        <TextInput
          mode="outlined"
          label="Description"
          placeholder="Décrivez votre bien..."
          value={draft.description}
          onChangeText={(description) => setDraft({ description })}
          multiline
          numberOfLines={5}
          style={styles.textArea}
        />

        <View style={styles.block}>
          <TextInput
            mode="outlined"
            label="Téléphone à afficher"
            placeholder="Optionnel, sinon téléphone pro"
            value={draft.contact_phone}
            onChangeText={(contact_phone) => setDraft({ contact_phone })}
            keyboardType="phone-pad"
          />
          <TextInput
            mode="outlined"
            label="Email à afficher"
            placeholder="Optionnel, sinon email du profil"
            value={draft.contact_email}
            onChangeText={(contact_email) => setDraft({ contact_email })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.block}>
          <SectionLabel>{isLocation ? 'Prix de location' : 'Prix de vente'}</SectionLabel>
          <View style={wizardStyles.row}>
            <TextInput
              mode="outlined"
              label={isLocation ? 'Montant par période' : 'Prix total'}
              value={draft.price}
              onChangeText={(t) => setDraft({ price: t.replace(/[^0-9.]/g, '') })}
              keyboardType="decimal-pad"
              style={styles.price}
            />
            <Button
              mode="outlined"
              icon="chevron-down"
              contentStyle={styles.currencyContent}
              style={styles.currency}
              onPress={() => setCurrencyOpen(true)}
              accessibilityLabel={`Devise : ${currencyLabel(draft.devise)}`}
            >
              {draft.devise}
            </Button>
          </View>
        </View>

        {isLocation && (
          <View>
            <SectionLabel>Période de paiement</SectionLabel>
            <View style={wizardStyles.wrap}>
              {PERIOD_OPTIONS.map((opt) => (
                <ChoiceChip
                  key={opt.value}
                  label={opt.label}
                  active={draft.period === opt.value}
                  onPress={() => setDraft({ period: opt.value })}
                />
              ))}
            </View>
          </View>
        )}

        <View style={[styles.recap, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Récapitulatif
          </Text>
          <View style={styles.recapRow}>
            <MaterialIcons name={TYPE_ICON[draft.type]} size={16} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              {TYPE_LABEL[draft.type]} · {isLocation ? 'Location' : 'Vente'}
            </Text>
          </View>
          <View style={styles.recapRow}>
            <MaterialIcons name="photo-library" size={16} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
              {draft.medias.length} média{draft.medias.length > 1 ? 's' : ''}
            </Text>
          </View>
          {!!draft.price && (
            <View style={styles.recapRow}>
              <MaterialIcons name="payments" size={16} color={C.primary} />
              <Text style={[Typography.bodyMd, { color: C.onSurface }]}>
                {Number(draft.price).toLocaleString('fr-FR')} {draft.devise}
                {isLocation ? ` / ${PERIOD_OPTIONS.find((p) => p.value === draft.period)?.label.toLowerCase() ?? ''}` : ''}
              </Text>
            </View>
          )}
          {!!place && (
            <View style={styles.recapRow}>
              <MaterialIcons name="place" size={16} color={C.primary} />
              <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1 }]}>{place}</Text>
            </View>
          )}
        </View>

        {progress && publishing && (
          <View style={[styles.progress, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
            <View style={styles.progressHead}>
              <Text numberOfLines={1} style={[Typography.caption, { color: C.onSurface, flex: 1 }]}>
                {`Upload ${progress.current}/${progress.total} · ${progress.fileName}`}
              </Text>
              <Text style={[Typography.caption, { color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }]}>
                {progress.percent}%
              </Text>
            </View>
            <ProgressBar progress={progress.percent / 100} color={C.primary} />
          </View>
        )}
      </ScrollView>

      <WizardFooter
        label={publishing ? (progress ? `${progress.percent}%` : 'Publication…') : "Publier l'annonce"}
        icon="rocket-launch"
        disabled={!canPublish}
        loading={publishing}
        onPress={handlePublish}
        error={error}
      />

      <OptionPickerDialog
        visible={currencyOpen}
        title="Devise"
        options={CURRENCY_OPTIONS}
        selected={draft.devise}
        onSelect={(devise) => setDraft({ devise })}
        onDismiss={() => setCurrencyOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  block: { gap: Spacing.md },
  textArea: { minHeight: 110 },
  price: { flex: 1 },
  currency: { alignSelf: 'center', marginTop: 6, borderRadius: Radius.md },
  currencyContent: { flexDirection: 'row-reverse', height: 52 },
  recap: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  recapRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progress: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  progressHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
