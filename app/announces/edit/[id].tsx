import * as ImagePicker from 'expo-image-picker';
import { usePreventRemove } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';

import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { CategoryPicker } from '@/components/forms/category-picker';
import { AmenityPicker, StandingPicker } from '@/components/forms/listing-features';
import {
  AD_TYPE_OPTIONS,
  DEVISE_OPTIONS,
  deviseLabel,
  MAX_BEDROOMS,
  MAX_LISTING_MEDIAS,
  type AmenityKey,
} from '@/components/forms/listing-options';
import { ListingRecap } from '@/components/forms/listing-recap';
import { AddPhotoTile, PhotoGrid, PhotoTile } from '@/components/forms/media-upload-grid';
import { StepFooter } from '@/components/forms/step-layout';
import {
  AppText,
  Banner,
  ChipGroup,
  Dialog,
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
import type { AnnounceUpdate } from '@/services/announces.service';
import { digitsOnly } from '@/lib/digits';
import { isNetworkError } from '@/lib/network-error';
import type { AdType, AnnounceType, Media, Standing } from '@/types/announce';

const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Limbé'];
const CITY_OPTIONS = CITIES.map((c) => ({ value: c, label: c }));
const TITLE = "Modifier l'annonce";

/** What the screen edits, compared with the loaded listing to detect unsaved changes. */
interface EditableValues {
  adType: AdType;
  categoryId: string;
  price: string;
  devise: string;
  description: string;
  address: string;
  city: string;
  bedrooms: number;
  size: string;
  standing: Standing | undefined;
  amenities: Record<AmenityKey, boolean>;
  newMediaUris: string[];
  removedMediaIds: string[];
}

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
  const [devise, setDevise] = useState('XAF');
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
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);
  useEffect(() => {
    if (!announce || initialized.current) return;
    initialized.current = true;
    const initial: EditableValues = {
      adType: announce.ad_type,
      categoryId: announce.category_id ?? '',
      price: String(announce.price ?? ''),
      devise: announce.devise ?? 'XAF',
      description: announce.description ?? '',
      address: announce.address ?? '',
      city: announce.city ?? 'Douala',
      bedrooms: announce.bedrooms ?? 0,
      size: announce.size != null ? String(announce.size) : '',
      standing: announce.standing,
      amenities: {
        wifi: !!announce.wifi,
        pool: !!announce.pool,
        air_conditioning: !!announce.air_conditioning,
        security_24h: !!announce.security_24h,
        gate: !!announce.gate,
        equipped_kitchen: !!announce.equipped_kitchen,
        smart_tv: !!announce.smart_tv,
      },
      newMediaUris: [],
      removedMediaIds: [],
    };
    setType(announce.type);
    setAdType(initial.adType);
    setCategoryId(initial.categoryId);
    setPrice(initial.price);
    setDevise(initial.devise);
    setDescription(initial.description);
    setAddress(initial.address);
    setCity(initial.city);
    setBedrooms(initial.bedrooms);
    setSize(initial.size);
    setStanding(initial.standing);
    setAmenities(initial.amenities);
    setInitialSnapshot(JSON.stringify(initial));
  }, [announce]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isRealestate = type === 'realestate';

  const allExistingMedias: Media[] = announce?.medias ?? [];
  const existingMedias = allExistingMedias.filter((m) => !removedMediaIds.includes(m.id));
  const totalPhotos = existingMedias.length + newMediaUris.length;
  // At least one photo, as the backend requires (media_ids may not be empty).
  const canSave = !!price && !!description && !!address && !!city && totalPhotos > 0;

  const current: EditableValues = {
    adType, categoryId, price, devise, description, address, city, bedrooms, size, standing, amenities,
    newMediaUris, removedMediaIds,
  };
  const dirty = initialSnapshot !== null && JSON.stringify(current) !== initialSnapshot;

  // Back arrow, Android back or swipe with unsaved changes: ask first.
  const navigation = useNavigation();
  const allowLeave = useRef(false);
  const [pendingLeave, setPendingLeave] = useState<Parameters<typeof navigation.dispatch>[0] | null>(null);
  usePreventRemove(dirty, ({ data }) => {
    if (allowLeave.current) navigation.dispatch(data.action);
    else setPendingLeave(data.action);
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleAmenity(key: AmenityKey) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: MAX_LISTING_MEDIAS - totalPhotos,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => a.uri);
      setNewMediaUris((prev) => [...prev, ...picked].slice(0, MAX_LISTING_MEDIAS - existingMedias.length));
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
    // JSON body with the backend's field names (AdsService.updateAd), as the
    // website's edit modal sends it. The property type cannot change on the
    // backend, so it is not sent; location fields the screen does not edit
    // (coordinates, region) are left as they are.
    const data: AnnounceUpdate = {
      description,
      price: Number(price),
      ad_type: adType,
      category_id: categoryId || null,
      devise,
      media_ids: existingMedias.map((m) => String(m.id)),
      address,
      city,
      ...(isRealestate
        ? {
            bedroom: bedrooms,
            size: size ? Number(size) : null,
            ...(standing ? { standing } : {}),
            wifi: amenities.wifi ? '1' : '0',
            air_conditioning: amenities.air_conditioning ? '1' : '0',
            security_24h: amenities.security_24h ? '1' : '0',
            smart_tv: amenities.smart_tv ? '1' : '0',
            equipped_kitchen: amenities.equipped_kitchen ? '1' : '0',
            gate: amenities.gate ? '1' : '0',
            pool: amenities.pool ? '1' : '0',
          }
        : {}),
    };

    updateAnnounce.mutate(
      { id, data, newMediaUris },
      {
        onSuccess: () => {
          toast.show('Annonce mise à jour.', 'success');
          allowLeave.current = true;
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
          hint="Indiquez le prix, la description, l'adresse, la ville et au moins une photo pour enregistrer."
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      {/* The backend keeps the property type of a listing (the website does not offer to change it). */}
      <Banner icon={type === 'realestate' ? 'home-work' : 'chair'}>
        {type === 'realestate' ? 'Annonce immobilière' : 'Annonce de mobilier'}
      </Banner>

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
          {totalPhotos < MAX_LISTING_MEDIAS ? <AddPhotoTile label="Ajouter" onPress={handlePickPhotos} /> : null}
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
          onChangeText={(t) => setPrice(digitsOnly(t))}
          keyboardType="number-pad"
          suffix={deviseLabel(devise)}
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
            onChangeText={(t) => setSize(digitsOnly(t))}
            keyboardType="number-pad"
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
      <Dialog
        visible={pendingLeave !== null}
        title="Quitter sans enregistrer ?"
        message="Vos modifications de l'annonce seront perdues."
        confirmLabel="Quitter"
        cancelLabel="Continuer la modification"
        danger
        onConfirm={() => {
          const action = pendingLeave;
          setPendingLeave(null);
          allowLeave.current = true;
          if (action) navigation.dispatch(action);
        }}
        onCancel={() => setPendingLeave(null)}
      />
    </Screen>
  );
}
