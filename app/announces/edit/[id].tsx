import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';

import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { CategoryPicker } from '@/components/forms/category-picker';
import { AmenityPicker, StandingPicker } from '@/components/forms/listing-features';
import {
  AD_TYPE_OPTIONS,
  DEVISE_OPTIONS,
  MAX_BEDROOMS,
  TYPE_OPTIONS,
  type AmenityKey,
} from '@/components/forms/listing-options';
import { ListingRecap } from '@/components/forms/listing-recap';
import { AddPhotoTile, PhotoGrid, PhotoTile } from '@/components/forms/media-upload-grid';
import { StepFooter } from '@/components/forms/step-layout';
import {
  AppText,
  Banner,
  ChipGroup,
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
import { Spacing } from '@/constants/theme';
import { useAnnounce, useUpdateAnnounce } from '@/hooks/queries/use-announces';
import { isNetworkError } from '@/lib/network-error';
import type { AdType, AnnounceType, Media, Standing } from '@/types/announce';

const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Limbé'];
const CITY_OPTIONS = CITIES.map((c) => ({ value: c, label: c }));
const TITLE = "Modifier l'annonce";

function Heading({ children }: { children: string }) {
  return (
    <AppText variant="bodyStrong" accessibilityRole="header">
      {children}
    </AppText>
  );
}

export default function EditAnnounceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const { data: announce, isLoading, isError, error, refetch } = useAnnounce(id);
  const updateAnnounce = useUpdateAnnounce();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [type, setType] = useState<AnnounceType>('realestate');
  const [adType, setAdType] = useState<AdType>('location');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Douala');
  const [bedrooms, setBedrooms] = useState(0);
  const [size, setSize] = useState('');
  const [standing, setStanding] = useState<Standing | undefined>(undefined);
  const [amenities, setAmenities] = useState<Record<AmenityKey, boolean>>({
    wifi: false,
    pool: false,
    air_conditioning: false,
    security_24h: false,
    gate: false,
    equipped_kitchen: false,
    smart_tv: false,
  });
  const [newMediaUris, setNewMediaUris] = useState<string[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);

  const descriptionRef = useRef<TextInput>(null);

  // Pre-populate once announce loads
  const initialized = useRef(false);
  useEffect(() => {
    if (!announce || initialized.current) return;
    initialized.current = true;
    setType(announce.type);
    setAdType(announce.ad_type);
    setCategoryId(announce.category_id ?? '');
    setPrice(String(announce.price ?? ''));
    setDevise(announce.devise ?? 'FCFA');
    setDescription(announce.description ?? '');
    setAddress(announce.address ?? '');
    setCity(announce.city ?? 'Douala');
    setBedrooms(announce.bedrooms ?? 0);
    setSize(announce.size != null ? String(announce.size) : '');
    setStanding(announce.standing);
    setAmenities({
      wifi: !!announce.wifi,
      pool: !!announce.pool,
      air_conditioning: !!announce.air_conditioning,
      security_24h: !!announce.security_24h,
      gate: !!announce.gate,
      equipped_kitchen: !!announce.equipped_kitchen,
      smart_tv: !!announce.smart_tv,
    });
  }, [announce]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isRealestate = type === 'realestate';

  const allExistingMedias: Media[] = announce?.medias ?? [];
  const existingMedias = allExistingMedias.filter((m) => !removedMediaIds.includes(m.id));
  const totalPhotos = existingMedias.length + newMediaUris.length;
  const canSave = !!price && !!description && !!address && !!city;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleAmenity(key: AmenityKey) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => a.uri);
      setNewMediaUris((prev) => [...prev, ...picked]);
    }
  }

  function removeNewMedia(index: number) {
    setNewMediaUris((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingMedia(mediaId: string) {
    setRemovedMediaIds((prev) => [...prev, mediaId]);
  }

  function handleSave() {
    if (!canSave) return;
    const formData = new FormData();
    formData.append('type', type);
    formData.append('ad_type', adType);
    if (categoryId) formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('devise', devise);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('city', city);
    if (size) formData.append('size', size);
    if (bedrooms) formData.append('bedrooms', String(bedrooms));
    if (standing) formData.append('standing', standing);
    formData.append('wifi', amenities.wifi ? '1' : '0');
    formData.append('air_conditioning', amenities.air_conditioning ? '1' : '0');
    formData.append('security_24h', amenities.security_24h ? '1' : '0');
    formData.append('smart_tv', amenities.smart_tv ? '1' : '0');
    formData.append('equipped_kitchen', amenities.equipped_kitchen ? '1' : '0');
    formData.append('gate', amenities.gate ? '1' : '0');
    formData.append('pool', amenities.pool ? '1' : '0');

    newMediaUris.forEach((uri) => {
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('medias[]', { uri, name: filename, type: mimeType } as unknown as Blob);
    });

    removedMediaIds.forEach((mediaId) => {
      formData.append('remove_media_ids[]', mediaId);
    });

    updateAnnounce.mutate(
      { id, formData },
      {
        onSuccess: () => {
          toast.show('Annonce mise à jour.', 'success');
          router.back();
        },
        onError: () => {
          toast.show('Erreur lors de la mise à jour.', 'error');
        },
      }
    );
  }

  const header = <ScreenHeader title={TITLE} onBack={() => router.back()} />;

  if (isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Chargement de l'annonce…" media={false} count={3} />
      </Screen>
    );
  }

  // Without the listing the form would start empty: never offer to save it.
  if (!announce) {
    return (
      <Screen header={header} contentStyle={{ flexGrow: 1 }}>
        {isError && isNetworkError(error) ? (
          <OfflineState onRetry={() => refetch()} />
        ) : (
          <ErrorState title="Impossible de charger l'annonce" onRetry={() => refetch()} />
        )}
      </Screen>
    );
  }

  return (
    <Screen
      keyboard
      header={header}
      footer={
        <StepFooter
          label="Enregistrer les modifications"
          icon="check-circle"
          onNext={handleSave}
          disabled={!canSave}
          loading={updateAnnounce.isPending}
          hint="Indiquez le prix, la description, l'adresse et la ville pour enregistrer."
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <View style={{ gap: Spacing.sm }}>
        <Heading>Type de bien</Heading>
        <SegmentedControl
          label="Type de bien"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(v) => {
            setType(v);
            setCategoryId('');
          }}
        />
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Heading>{"Type d'annonce"}</Heading>
        <SegmentedControl label="Type d'annonce" options={AD_TYPE_OPTIONS} value={adType} onChange={setAdType} />
      </View>

      <CategoryPicker type={type} value={categoryId} onChange={setCategoryId} />

      <View style={{ gap: Spacing.sm }}>
        <Heading>{`Photos (${totalPhotos})`}</Heading>
        <PhotoGrid>
          {existingMedias.map((media, i) => (
            <PhotoTile
              key={media.id}
              uri={media.thumbnail ?? media.file}
              label={`Photo ${i + 1}`}
              badge={i === 0 ? 'Principale' : undefined}
              onRemove={() => removeExistingMedia(media.id)}
            />
          ))}
          {newMediaUris.map((uri, i) => (
            <PhotoTile
              key={`new-${i}`}
              uri={uri}
              label={`Photo ${existingMedias.length + i + 1}`}
              badge="Nouvelle"
              onRemove={() => removeNewMedia(i)}
            />
          ))}
          <AddPhotoTile label="Ajouter" onPress={handlePickPhotos} />
        </PhotoGrid>
        {removedMediaIds.length > 0 ? (
          <Banner icon="delete-outline">
            {`${removedMediaIds.length} photo${removedMediaIds.length > 1 ? 's' : ''} supprimée${removedMediaIds.length > 1 ? 's' : ''} à l'enregistrement.`}
          </Banner>
        ) : null}
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Field
          label="Prix"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          suffix={devise}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => descriptionRef.current?.focus()}
        />
        <SegmentedControl label="Devise" options={DEVISE_OPTIONS} value={devise} onChange={setDevise} />
      </View>

      <Field
        ref={descriptionRef}
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Décrivez votre bien..."
        multiline
        numberOfLines={5}
      />

      <AddressAutocomplete value={address} onChange={setAddress} returnKeyType="done" />

      <View style={{ gap: Spacing.sm }}>
        <Heading>Ville</Heading>
        <ChipGroup label="Ville" options={CITY_OPTIONS} value={city} onChange={setCity} />
      </View>

      {isRealestate ? (
        <>
          <Stepper
            label="Chambres"
            helper="0 pour un studio"
            value={bedrooms}
            onChange={setBedrooms}
            min={0}
            // A listing created on the website may have more than the 5 offered here.
            max={Math.max(MAX_BEDROOMS, announce.bedrooms ?? 0)}
          />
          <Field
            label="Surface"
            labelHint="(facultatif)"
            placeholder="Ex. 120"
            value={size}
            onChangeText={setSize}
            keyboardType="numeric"
            suffix="m²"
            returnKeyType="done"
          />
          <StandingPicker value={standing} onChange={setStanding} />
          <AmenityPicker value={amenities} onToggle={toggleAmenity} />
        </>
      ) : null}

      <ListingRecap
        type={type}
        adType={adType}
        photos={`${totalPhotos} photo${totalPhotos > 1 ? 's' : ''} (${existingMedias.length} existante${existingMedias.length > 1 ? 's' : ''}${newMediaUris.length > 0 ? ` + ${newMediaUris.length} nouvelle${newMediaUris.length > 1 ? 's' : ''}` : ''})`}
        price={price}
        devise={devise}
        address={address}
        city={city}
      />
    </Screen>
  );
}
