import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ListingRecap } from '@/components/forms/listing-recap';
import { MAX_PHOTOS, MediaUploadGrid } from '@/components/forms/media-upload-grid';
import { CREATE_TITLE, createStepTotal, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { Banner, Button, Screen, StepHeader, useToast } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useCreateAnnounce } from '@/hooks/queries/use-announces';
import { isNetworkError } from '@/lib/network-error';
import { useCreateListingStore } from '@/stores/create-listing.store';

/** `message` of a NestJS error response (a string, or the validation list). */
function serverMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const message = (error.response?.data as { message?: unknown } | undefined)?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message) && message.length) return message.join(' ');
  return null;
}

export default function CreateStep5Screen() {
  const router = useRouter();
  const toast = useToast();
  const { draft, setDraft, resetDraft } = useCreateListingStore();
  const createAnnounce = useCreateAnnounce();
  const total = createStepTotal(draft.type);

  const canPublish = draft.medias.length > 0;
  // 403 from POST /announces: not an announcer, or no publication left in
  // the packs (backend ensureAnnouncerUser / assertCanPublish). The server's
  // message is shown as is, with the way to the packs.
  const [refusal, setRefusal] = useState<string | null>(null);

  function handlePublish() {
    if (!canPublish) return;
    // Field names as read by the backend (AdsService.create) and sent by the
    // website: bedroom, neighbourhood; devise is an ISO code (XAF). No zip: the
    // website's form has no postal code field (the backend fills it from the
    // coordinates when the location is automatic).
    const formData = new FormData();
    formData.append('type', draft.type);
    formData.append('ad_type', draft.ad_type);
    formData.append('category_id', draft.category_id);
    formData.append('price', draft.price);
    formData.append('devise', draft.devise);
    formData.append('description', draft.description);
    formData.append('address', draft.address);
    formData.append('city', draft.city);
    if (draft.state) formData.append('state', draft.state);
    if (draft.country) formData.append('country', draft.country);
    if (draft.neighborhood) formData.append('neighbourhood', draft.neighborhood);
    formData.append('location_source', draft.location_source);
    formData.append('hide_on_map', draft.hide_on_map ? '1' : '0');
    if (draft.longitude != null && draft.latitude != null) {
      formData.append('localization[0]', String(draft.longitude));
      formData.append('localization[1]', String(draft.latitude));
    }
    if (draft.size) formData.append('size', draft.size);
    formData.append('bedroom', String(draft.bedrooms));
    if (draft.standing) formData.append('standing', draft.standing);
    formData.append('wifi', draft.wifi ? '1' : '0');
    formData.append('air_conditioning', draft.air_conditioning ? '1' : '0');
    formData.append('security_24h', draft.security_24h ? '1' : '0');
    formData.append('smart_tv', draft.smart_tv ? '1' : '0');
    formData.append('equipped_kitchen', draft.equipped_kitchen ? '1' : '0');
    formData.append('gate', draft.gate ? '1' : '0');
    formData.append('pool', draft.pool ? '1' : '0');
    draft.medias.forEach((uri) => {
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('medias[]', { uri, name: filename, type } as unknown as Blob);
    });
    setRefusal(null);
    createAnnounce.mutate(formData, {
      onSuccess: () => {
        resetDraft();
        router.replace('/profile/my-listings');
      },
      // The draft is kept: the user can publish again once the cause is fixed.
      onError: (error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401) {
          router.push({ pathname: '/(auth)/login', params: { redirect: '/announces/create/step-5' } });
          return;
        }
        if (status === 403) {
          const message = serverMessage(error) ?? "Votre compte ne permet pas de publier cette annonce pour l'instant.";
          // The toast is seen wherever the page is scrolled; the banner keeps
          // the message and the link to the packs.
          toast.show(message, 'error');
          setRefusal(message);
          return;
        }
        toast.show(
          isNetworkError(error)
            ? "Pas de connexion internet. Votre annonce n'a pas été publiée, réessayez."
            : "L'annonce n'a pas pu être publiée. Réessayez dans un instant.",
          'error',
        );
      },
    });
  }

  return (
    <Screen
      header={<StepHeader title={CREATE_TITLE} step={total} total={total} onBack={() => router.back()} />}
      footer={
        <StepFooter
          onPrevious={() => router.back()}
          label="Publier l'annonce"
          icon="publish"
          onNext={handlePublish}
          disabled={!canPublish}
          loading={createAnnounce.isPending}
          hint="Ajoutez au moins une photo pour publier."
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro title="Photos" description="Ajoutez des photos de votre bien." />

      {/* Tip: encouraging, not a requirement */}
      <Banner icon="lightbulb-outline">
        {`Plus vous ajoutez de photos, plus votre annonce inspire confiance et attire de contacts. Vous pouvez en ajouter jusqu'à ${MAX_PHOTOS}.`}
      </Banner>

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

      <MediaUploadGrid uris={draft.medias} onChange={(uris) => setDraft({ medias: uris })} />

      <ListingRecap
        type={draft.type}
        adType={draft.ad_type}
        photos={`${draft.medias.length} photo${draft.medias.length > 1 ? 's' : ''}`}
        price={draft.price}
        devise={draft.devise}
        address={draft.address}
        city={draft.city}
      />
    </Screen>
  );
}
