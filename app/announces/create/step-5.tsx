import { useRouter } from 'expo-router';

import { ListingRecap } from '@/components/forms/listing-recap';
import { MAX_PHOTOS, MediaUploadGrid } from '@/components/forms/media-upload-grid';
import { CREATE_TITLE, createStepTotal, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { Banner, Screen, StepHeader, useToast } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useCreateAnnounce } from '@/hooks/queries/use-announces';
import { isNetworkError } from '@/lib/network-error';
import { useCreateListingStore } from '@/stores/create-listing.store';

export default function CreateStep5Screen() {
  const router = useRouter();
  const toast = useToast();
  const { draft, setDraft, resetDraft } = useCreateListingStore();
  const createAnnounce = useCreateAnnounce();
  const total = createStepTotal(draft.type);

  const canPublish = draft.medias.length > 0;

  function handlePublish() {
    if (!canPublish) return;
    // Field names as read by the backend (AdsService.create) and sent by the
    // website: bedroom, neighbourhood, zip; devise is an ISO code (XAF).
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
    if (draft.postal_code) formData.append('zip', draft.postal_code);
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
    createAnnounce.mutate(formData, {
      onSuccess: () => {
        resetDraft();
        router.replace('/profile/my-listings');
      },
      // The draft is kept: the user can publish again once the cause is fixed.
      onError: (error) => {
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
