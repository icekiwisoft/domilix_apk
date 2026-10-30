import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Share, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnnouncerCard } from '@/components/announcer/announcer-card';
import { announcePlace, announceTitle } from '@/components/listing/announce-card';
import { categoryLabel } from '@/lib/category-label';
import { AnnounceDetailSkeleton } from '@/components/listing/announce-detail-skeleton';
import { ListingGallery } from '@/components/listing/listing-gallery';
import {
  AppText,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  PriceTag,
  Screen,
  ScreenHeader,
  type IconName,
} from '@/components/ui';
import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useAnnounce, useToggleLike } from '@/hooks/queries/use-announces';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/stores/auth.store';
import type { Announce, Standing } from '@/types/announce';

// Labels of the website (domilix.com messages/fr.json, adForm.fields.amenities).
const AMENITIES: {
  key: keyof Pick<
    Announce,
    'wifi' | 'pool' | 'air_conditioning' | 'security_24h' | 'gate' | 'smart_tv' | 'equipped_kitchen'
  >;
  icon: IconName;
  label: string;
}[] = [
  { key: 'wifi', icon: 'wifi', label: 'WiFi inclus' },
  { key: 'pool', icon: 'pool', label: 'Piscine' },
  { key: 'air_conditioning', icon: 'ac-unit', label: 'Climatisation' },
  { key: 'security_24h', icon: 'security', label: 'Sécurité 24h/24' },
  { key: 'gate', icon: 'door-sliding', label: 'Portail sécurisé' },
  { key: 'smart_tv', icon: 'tv', label: 'Smart TV' },
  { key: 'equipped_kitchen', icon: 'kitchen', label: 'Cuisine équipée' },
];

const STANDING_LABELS: Record<Standing, string> = {
  standard: 'Standard',
  confort: 'Confort',
  haut_standing: 'Haut standing',
};

/** Descriptions longer than this are folded to a few lines with "Lire la suite". */
const LONG_DESCRIPTION = 180;
const FOLDED_LINES = 4;
/** The full text stays readable in the Description section below. */
const TITLE_LINES = 3;

type Fact = { icon: IconName; value: string; label: string };

function facts(a: Announce): Fact[] {
  const list: (Fact | null)[] = [
    a.bedrooms != null
      ? { icon: 'bed', value: String(a.bedrooms), label: a.bedrooms > 1 ? 'Chambres' : 'Chambre' }
      : null,
    a.size != null ? { icon: 'square-foot', value: `${a.size} m²`, label: 'Superficie' } : null,
    a.standing ? { icon: 'star-outline', value: STANDING_LABELS[a.standing] ?? a.standing, label: 'Standing' } : null,
    { icon: 'favorite-border', value: String(a.likes_count ?? 0), label: 'Favoris' },
  ];
  return list.filter((f): f is Fact => f !== null);
}

function FactTile({ fact, wide }: { fact: Fact; wide: boolean }) {
  const C = useThemeColors();
  return (
    <View
      accessible
      accessibilityLabel={`${fact.label} : ${fact.value}`}
      style={{
        flexGrow: 1,
        flexBasis: wide ? '40%' : 0,
        alignItems: 'center',
        gap: Spacing.xxs,
        paddingVertical: Spacing.ms,
        paddingHorizontal: Spacing.xs,
        borderRadius: Radii.control,
        borderWidth: Borders.thin,
        borderColor: C.outlineVariant,
        backgroundColor: C.surfaceContainerLowest,
      }}
    >
      <MaterialIcons name={fact.icon} size={Sizes.icon} color={C.onSurfaceVariant} />
      <AppText variant="bodyStrong" style={{ textAlign: 'center' }}>
        {fact.value}
      </AppText>
      <AppText variant="caption" color="onSurfaceVariant" style={{ textAlign: 'center' }}>
        {fact.label}
      </AppText>
    </View>
  );
}

function AmenityPill({ icon, label }: { icon: IconName; label: string }) {
  const C = useThemeColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        minHeight: Sizes.avatarSm,
        paddingHorizontal: Spacing.ms,
        paddingVertical: Spacing.xs,
        borderRadius: Radii.full,
        backgroundColor: C.primaryFixed,
      }}
    >
      <MaterialIcons name={icon} size={Sizes.iconSm} color={C.onPrimaryFixed} />
      <AppText variant="label" color="onPrimaryFixed" style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="headline" accessibilityRole="header">
      {children}
    </AppText>
  );
}

export default function AnnounceDetailScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: announce, isLoading, isError, isFetching, refetch } = useAnnounce(id ?? '');
  const toggleLike = useToggleLike();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return <AnnounceDetailSkeleton onBack={() => router.back()} />;
  }

  if (!announce) {
    return (
      <Screen header={<ScreenHeader title="Annonce" />}>
        {isError ? (
          <ErrorState title="Impossible de charger cette annonce" onRetry={() => refetch()} />
        ) : (
          <EmptyState
            icon="search-off"
            title="Annonce introuvable"
            description="Cette annonce n'existe pas ou n'est plus disponible."
            actionLabel="Retour"
            onAction={() => router.back()}
          />
        )}
      </Screen>
    );
  }

  const a = announce;
  const rent = a.ad_type === 'location';
  const galleryHeight = insets.top + Sizes.detailGallery;
  const activeAmenities = a.type === 'realestate' ? AMENITIES.filter((m) => a[m.key]) : [];
  const factList = facts(a);
  const longDescription = a.description.length > LONG_DESCRIPTION;
  const address = [a.address, a.state].filter(Boolean).join(', ');

  function handleUnlock() {
    if (a.unlocked) {
      const phone = a.contact_phone ?? a.announcer?.professional_phone ?? a.announcer?.contact;
      if (phone) Linking.openURL(`tel:${phone}`);
    } else if (!accessToken) {
      router.push({
        pathname: '/(auth)/login',
        params: { redirect: `/announces/${a.id}` },
      });
    } else {
      router.push({
        pathname: '/(modals)/unlock-confirm',
        params: { announceId: a.id },
      });
    }
  }

  // Same text and public URL as the website's ShareModal (domilix.com
  // src/views/Ad/Ad.tsx + src/utils/adPath.ts). Android ignores `url`, so the
  // link goes inside `message`.
  function handleShare() {
    const path = a.type === 'furniture' ? 'furnitures' : 'houses';
    const url = `https://domilix.com/fr/${path}/${a.id}`;
    const title = `${a.category?.name || 'Annonce'} · ${a.city || a.address || 'Localisation'}`;
    const currency = !a.devise || a.devise === 'XAF' ? 'FCFA' : a.devise;
    const price = `${a.price.toLocaleString('fr-FR')} ${currency}`;
    const message = `${title} - ${price}\n${url}`;
    Share.share({ title, message }).catch(() => {});
  }

  const footer = (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: Spacing.ms,
        paddingHorizontal: Spacing.marginMobile,
        paddingTop: Spacing.ms,
        paddingBottom: Spacing.ms,
        borderTopWidth: Borders.thin,
        borderTopColor: C.outlineVariant,
        backgroundColor: C.surfaceContainerLowest,
      }}
    >
      {/* At large font sizes the button drops under the price instead of squeezing it. */}
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: '40%' }}>
        <PriceTag amount={a.price} currency={a.devise} period={rent ? (a.period ?? 'month') : null} color="onSurface" />
        <AppText variant="caption" color="onSurfaceVariant">
          {rent ? 'Location' : 'Prix de vente'}
        </AppText>
      </View>
      <Button
        size="lg"
        icon={a.unlocked ? 'call' : 'lock-open'}
        label={a.unlocked ? 'Contacter' : 'Débloquer le contact'}
        accessibilityLabel={a.unlocked ? "Contacter l'annonceur" : 'Débloquer les coordonnées'}
        onPress={handleUnlock}
        style={{ flexGrow: 1 }}
      />
    </View>
  );

  return (
    <Screen
      heroHeight={galleryHeight}
      footer={footer}
      onRefresh={refetch}
      refreshing={isFetching && !isLoading}
      showsVerticalScrollIndicator={false}
      contentStyle={{ gap: 0 }}
    >
      <View>
        <ListingGallery medias={a.medias} height={galleryHeight} announceId={a.id} bottomInset={Spacing.lg} />
        <View
          style={{
            position: 'absolute',
            top: insets.top + Spacing.sm,
            left: Spacing.ms,
            right: Spacing.ms,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <IconButton icon="arrow-back" label="Retour" overlay onPress={() => router.back()} />
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <IconButton icon="share" label="Partager l'annonce" overlay onPress={handleShare} />
            <IconButton
              icon="favorite-border"
              selectedIcon="favorite"
              selected={a.liked}
              label={a.liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              overlay
              onPress={() => toggleLike.mutate(id ?? '')}
            />
          </View>
        </View>
      </View>

      <View
        style={{
          marginTop: -Spacing.lg,
          borderTopLeftRadius: Radii.card,
          borderTopRightRadius: Radii.card,
          backgroundColor: C.background,
          paddingHorizontal: Spacing.marginMobile,
          paddingTop: Spacing.marginMobile,
          gap: Spacing.lg,
        }}
      >
        {/* Title */}
        <View style={{ gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm }}>
            <Badge label={rent ? 'À louer' : 'À vendre'} variant={rent ? 'primary' : 'tertiary'} />
            {a.category?.name ? (
              <AppText variant="caption" color="onSurfaceVariant" style={{ flexShrink: 1 }}>
                {categoryLabel(a.category.name)}
              </AppText>
            ) : null}
          </View>
          {/* The API has no title: the first sentence can be the whole description (no full stop). */}
          <AppText variant="title" accessibilityRole="header" numberOfLines={TITLE_LINES}>
            {announceTitle(a)}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <MaterialIcons name="location-on" size={Sizes.iconSm} color={C.onSurfaceVariant} />
            <AppText color="onSurfaceVariant" style={{ flex: 1 }}>
              {announcePlace(a)}
            </AppText>
          </View>
        </View>

        {/* Key facts */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {factList.map((f) => (
            <FactTile key={f.label} fact={f} wide={fontScale >= 1.3 || factList.length > 3} />
          ))}
        </View>

        {/* Description */}
        <View style={{ gap: Spacing.sm }}>
          <SectionTitle>Description</SectionTitle>
          <AppText numberOfLines={longDescription && !expanded ? FOLDED_LINES : undefined}>{a.description}</AppText>
          {longDescription ? (
            <Button
              variant="text"
              label={expanded ? 'Afficher moins' : 'Lire la suite'}
              accessibilityState={{ expanded }}
              onPress={() => setExpanded((v) => !v)}
              style={{ alignSelf: 'flex-start', marginLeft: -Spacing.ms }}
            />
          ) : null}
        </View>

        {/* Amenities */}
        {activeAmenities.length > 0 ? (
          <View style={{ gap: Spacing.ms }}>
            <SectionTitle>Équipements & services</SectionTitle>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              {activeAmenities.map((m) => (
                <AmenityPill key={m.key} icon={m.icon} label={m.label} />
              ))}
            </View>
          </View>
        ) : null}

        {/* Location */}
        <View style={{ gap: Spacing.sm }}>
          <SectionTitle>Localisation</SectionTitle>
          <View style={{ flexDirection: 'row', gap: Spacing.ms }}>
            <MaterialIcons name="location-on" size={Sizes.iconLg} color={C.onSurfaceVariant} />
            <View style={{ flex: 1, gap: Spacing.xxs }}>
              <AppText variant="bodyStrong">{a.city}</AppText>
              {address ? <AppText color="onSurfaceVariant">{address}</AppText> : null}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.ms }}>
            <MaterialIcons
              name={a.unlocked ? 'lock-open' : 'verified-user'}
              size={Sizes.iconLg}
              color={C.onSurfaceVariant}
            />
            <AppText color="onSurfaceVariant" style={{ flex: 1 }}>
              {a.unlocked
                ? "Annonce débloquée : vous avez accès aux coordonnées de l'annonceur."
                : "Contact sécurisé : débloquez l'annonce pour accéder aux coordonnées de l'annonceur."}
            </AppText>
          </View>
        </View>

        {/* Announcer */}
        {/* Anonymised by the backend on every listing, as on the website: no profile link (QA-01). */}
        <View style={{ gap: Spacing.ms }}>
          <SectionTitle>{"L'annonceur"}</SectionTitle>
          <AnnouncerCard verified={!!a.announcer?.verified} />
        </View>
      </View>
    </Screen>
  );
}
