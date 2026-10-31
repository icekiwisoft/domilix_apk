import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { deviseLabel } from '@/components/forms/listing-options';
import { ListingRecap } from '@/components/forms/listing-recap';
import { OptionPickerDialog } from '@/components/forms/option-picker-dialog';
import { CREATE_STEPS, CREATE_TITLE, StepFooter, StepIntro } from '@/components/forms/step-layout';
import {
  AppText,
  Banner,
  Button,
  ChipGroup,
  Field,
  ProgressBar,
  Screen,
  StepHeader,
  useToast,
} from '@/components/ui';
import { CURRENCY_OPTIONS, PERIOD_OPTIONS, currencyLabel } from '@/constants/listing';
import { Spacing } from '@/constants/theme';
import { useCreateAnnounce, type UploadProgress } from '@/hooks/queries/use-announces';
import { getApiErrorMessage } from '@/lib/api-error';
import { digitsOnly } from '@/lib/digits';
import { isNetworkError } from '@/lib/network-error';
import { useCreateListingStore } from '@/stores/create-listing.store';

export default function CreateStep4Screen() {
  const router = useRouter();
  const toast = useToast();
  const { draft, setDraft, resetDraft } = useCreateListingStore();
  const createAnnounce = useCreateAnnounce();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  // 403 from POST /announces: not an announcer, or no publication left in
  // the packs (backend ensureAnnouncerUser / assertCanPublish). The server's
  // message is shown as is, with the way to the packs.
  const [refusal, setRefusal] = useState<string | null>(null);

  const isLocation = draft.ad_type === 'location';
  const canPublish =
    !!draft.description.trim() &&
    !!draft.price.trim() &&
    draft.medias.length > 0 &&
    (draft.type !== 'land' || Number(draft.size) > 0) &&
    (!isLocation || !!draft.period);
  const publishing = createAnnounce.isPending;
  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === draft.period)?.label.toLowerCase();

  function handlePublish() {
    if (!canPublish || publishing) return;
    setRefusal(null);
    createAnnounce.mutate(
      { draft, onProgress: setProgress },
      {
        onSuccess: () => {
          resetDraft();
          router.replace('/profile/my-listings');
        },
        // The draft is kept: the user can publish again once the cause is fixed.
        onError: (error) => {
          setProgress(null);
          const status = isAxiosError(error) ? error.response?.status : undefined;
          if (status === 401) {
            router.push({ pathname: '/(auth)/login', params: { redirect: '/announces/create/step-4' } });
            return;
          }
          if (status === 403) {
            const message = getApiErrorMessage(
              error,
              "Votre compte ne permet pas de publier cette annonce pour l'instant."
            );
            // The toast is seen wherever the page is scrolled; the banner keeps
            // the message and the link to the packs.
            toast.show(message, 'error');
            setRefusal(message);
            return;
          }
          toast.show(
            isNetworkError(error)
              ? "Pas de connexion internet. Votre annonce n'a pas été publiée, réessayez."
              : getApiErrorMessage(error, "L'annonce n'a pas pu être publiée. Réessayez dans un instant."),
            'error'
          );
        },
      }
    );
  }

  return (
    <Screen
      keyboard
      header={<StepHeader title={CREATE_TITLE} step={4} total={CREATE_STEPS} onBack={() => router.back()} />}
      footer={
        <StepFooter
          onPrevious={() => router.back()}
          label={publishing ? (progress ? `Envoi ${progress.percent} %` : 'Publication…') : "Publier l'annonce"}
          icon="publish"
          onNext={handlePublish}
          disabled={!canPublish}
          loading={publishing}
          hint={
            isLocation
              ? 'Indiquez une description, un prix et une période de paiement pour publier.'
              : 'Indiquez une description et un prix pour publier.'
          }
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro title="Prix & description" description="Dernière étape avant la publication de votre annonce." />

      {refusal ? (
        <Banner
          tone="error"
          action={
            <Button
              variant="text"
              icon="toll"
              label="Voir les packs Domicoin"
              onPress={() => router.push('/profile/subscriptions')}
              style={{ alignSelf: 'flex-start' }}
            />
          }
        >
          {refusal}
        </Banner>
      ) : null}

      <Field
        label="Description"
        value={draft.description}
        onChangeText={(description) => setDraft({ description })}
        placeholder="Décrivez votre bien : état, atouts, équipements..."
        multiline
        numberOfLines={5}
      />

      <Field
        label="Téléphone à afficher"
        labelHint="(facultatif)"
        helper="Sinon, le téléphone de votre profil annonceur."
        value={draft.contact_phone}
        onChangeText={(contact_phone) => setDraft({ contact_phone })}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <Field
        label="Email à afficher"
        labelHint="(facultatif)"
        helper="Sinon, l'email de votre profil."
        value={draft.contact_email}
        onChangeText={(contact_email) => setDraft({ contact_email })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
      />

      <View style={{ gap: Spacing.sm }}>
        <Field
          label={isLocation ? 'Prix de location' : 'Prix de vente'}
          labelHint={isLocation ? '(par période)' : undefined}
          value={draft.price}
          onChangeText={(t) => setDraft({ price: digitsOnly(t) })}
          keyboardType="number-pad"
          suffix={deviseLabel(draft.devise)}
        />
        <Button
          variant="secondary"
          icon="expand-more"
          label={`Devise : ${currencyLabel(draft.devise)}`}
          onPress={() => setCurrencyOpen(true)}
          style={{ alignSelf: 'flex-start' }}
        />
      </View>

      {isLocation ? (
        <View style={{ gap: Spacing.sm }}>
          <AppText variant="bodyStrong" accessibilityRole="header">
            Période de paiement
          </AppText>
          <ChipGroup
            label="Période de paiement"
            options={PERIOD_OPTIONS}
            value={draft.period || null}
            onChange={(period) => setDraft({ period })}
          />
        </View>
      ) : null}

      <ListingRecap
        type={draft.type}
        adType={draft.ad_type}
        photos={`${draft.medias.length} média${draft.medias.length > 1 ? 's' : ''}`}
        price={draft.price}
        devise={draft.devise}
        period={isLocation ? periodLabel : undefined}
        address={draft.address || draft.neighbourhood}
        city={draft.city}
      />

      {progress && publishing ? (
        <View style={{ gap: Spacing.sm }} accessibilityLiveRegion="polite">
          <AppText variant="caption" numberOfLines={1}>
            {`Envoi ${progress.current}/${progress.total} · ${progress.fileName} · ${progress.percent} %`}
          </AppText>
          <ProgressBar value={progress.percent / 100} label="Envoi des médias" />
        </View>
      ) : null}

      <OptionPickerDialog
        visible={currencyOpen}
        title="Devise"
        options={CURRENCY_OPTIONS}
        selected={draft.devise}
        onSelect={(devise) => setDraft({ devise })}
        onDismiss={() => setCurrencyOpen(false)}
      />
    </Screen>
  );
}
