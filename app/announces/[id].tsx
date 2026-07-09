import { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, IconButton } from 'react-native-paper';

import { ListingGallery } from '@/components/listing/listing-gallery';
import { AnnouncerCard } from '@/components/announcer/announcer-card';
import { AnnounceDetailSkeleton } from '@/components/listing/announce-detail-skeleton';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useAnnounce,
  useToggleLike,
  useAnnounces,
} from '@/hooks/queries/use-announces';
import { useAuthStore } from '@/stores/auth.store';
import type { Announce } from '@/types/announce';

// ─── Amenities ────────────────────────────────────────────────────────────────
const AMENITIES: {
  key: keyof Pick<
    Announce,
    'wifi' | 'pool' | 'air_conditioning' | 'security_24h' | 'gate' | 'smart_tv' | 'equipped_kitchen'
  >;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
}[] = [
  { key: 'wifi', icon: 'wifi', label: 'Wifi haut débit' },
  { key: 'pool', icon: 'pool', label: 'Piscine privée' },
  { key: 'air_conditioning', icon: 'ac-unit', label: 'Climatisation' },
  { key: 'security_24h', icon: 'security', label: 'Gardiennage 24h/7j' },
  { key: 'gate', icon: 'door-sliding', label: 'Portail sécurisé' },
  { key: 'smart_tv', icon: 'tv', label: 'Smart TV' },
  { key: 'equipped_kitchen', icon: 'kitchen', label: 'Cuisine équipée' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AnnounceDetailScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: announce, isLoading, isFetching, refetch } = useAnnounce(id ?? '');
  const { data: announcerListingsData } = useAnnounces(
    announce?.announcer?.id ? { AnnouncerId: announce.announcer.id } : {}
  );
  const toggleLike = useToggleLike();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [expanded, setExpanded] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const GALLERY_H = insets.top + 320;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <AnnounceDetailSkeleton onBack={() => router.back()} />
      </View>
    );
  }

  if (!announce) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, paddingTop: insets.top }}>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, padding: Spacing.lg }]}>
          Annonce introuvable.
        </Text>
      </View>
    );
  }

  function truncateWords(text: string, max = 10): string {
    const words = text.trim().split(/\s+/);
    if (words.length <= max) return text;
    return words.slice(0, max).join(' ') + '…';
  }

  const announcerListingsCount = (announcerListingsData?.data ?? []).filter(
    (a) => a.id !== announce.id
  ).length;
  const activeAmenities = AMENITIES.filter((a) => announce[a.key]);
  const visibleAmenities = showAllAmenities ? activeAmenities : activeAmenities.slice(0, 5);
  const displayName =
    announce.announcer?.company_name ?? announce.announcer?.name ?? 'Annonceur';

  // Subtitle parts
  const locationLine = [announce.category?.name, announce.city, announce.country]
    .filter(Boolean)
    .join(', ');
  const statsLine = [
    announce.bedrooms != null ? `${announce.bedrooms} chambre${announce.bedrooms > 1 ? 's' : ''}` : null,
    announce.size != null ? `${announce.size} m²` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  function handleUnlock() {
    if (announce!.unlocked) {
      const phone =
        announce!.contact_phone ??
        announce!.announcer?.professional_phone ??
        announce!.announcer?.contact;
      if (phone) Linking.openURL(`tel:${phone}`);
    } else if (!accessToken) {
      router.push({
        pathname: '/(auth)/login',
        params: { redirect: `/announces/${announce!.id}` },
      });
    } else {
      router.push({
        pathname: '/(modals)/unlock-confirm',
        params: { announceId: announce!.id },
      });
    }
  }

  function handleShare() {
    const title = announce!.description.split('.')[0];
    const message = `${title} — ${announce!.address}, ${announce!.city}\n${announce!.price.toLocaleString('fr-FR')} ${announce!.devise}`;
    Share.share({ title, message });
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {/* ── Gallery ── */}
        <View style={{ height: GALLERY_H, position: 'relative' }}>
          <ListingGallery
            medias={announce.medias}
            height={GALLERY_H}
            announceId={announce.id}
          />

          {/* Back — white pill button */}
          <IconButton
            icon="arrow-left"
            accessibilityLabel="Retour"
            onPress={() => router.back()}
            iconColor="#222"
            containerColor="rgba(255,255,255,0.95)"
            size={20}
            style={[styles.backBtn, { top: insets.top + 10 }]}
          />

          {/* Share + Heart — plain icons, no background */}
          <View style={[styles.topActions, { top: insets.top + 10 }]}>
            <IconButton
              icon="share-variant-outline"
              accessibilityLabel="Partager l'annonce"
              onPress={handleShare}
              iconColor="#222"
              containerColor="rgba(255,255,255,0.95)"
              size={20}
              style={styles.iconBtn}
            />
            <IconButton
              icon={announce.liked ? 'heart' : 'heart-outline'}
              accessibilityLabel={announce.liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              accessibilityState={{ selected: announce.liked }}
              onPress={() => toggleLike.mutate(id ?? '')}
              iconColor={announce.liked ? '#e53935' : '#222'}
              containerColor="rgba(255,255,255,0.95)"
              size={20}
              style={styles.iconBtn}
            />
          </View>
        </View>

        {/* ── Content card ── */}
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          {/* Title */}
          <View style={styles.titleRow}>
            <MaterialIcons name="home-work" size={22} color={C.onSurface} style={{ marginTop: 2 }} />
            <Text style={[styles.title, { color: C.onSurface }]}>
              {truncateWords(announce.description.split('.')[0])}
            </Text>
          </View>

          {/* Subtitles — centered gray */}
          {locationLine ? (
            <Text style={[styles.subtitle, { color: C.onSurfaceVariant }]}>{locationLine}</Text>
          ) : null}
          {statsLine ? (
            <Text style={[styles.subtitle, { color: C.onSurfaceVariant }]}>{statsLine}</Text>
          ) : null}

          {/* ── 3-column stats (Airbnb style) ── */}
          <View style={[styles.statsBox, { borderColor: C.outlineVariant }]}>
            {/* Col 1 — Price */}
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: C.onSurface }]}>
                {announce.price.toLocaleString('fr-FR')}
              </Text>
              <Text style={[styles.statsSub, { color: C.onSurfaceVariant }]}>
                {announce.devise}{announce.ad_type === 'location' ? ' /mois' : ''}
              </Text>
            </View>

            <View style={[styles.statsLine, { backgroundColor: C.outlineVariant }]} />

            {/* Col 2 — Type */}
            <View style={styles.statsCol}>
              <MaterialIcons
                name={announce.ad_type === 'location' ? 'vpn-key' : 'sell'}
                size={22}
                color={C.primary}
              />
              <Text style={[styles.statsSub, styles.statsBold, { color: C.onSurface }]}>
                {announce.ad_type === 'location' ? 'Location' : 'Vente'}
              </Text>
            </View>

            <View style={[styles.statsLine, { backgroundColor: C.outlineVariant }]} />

            {/* Col 3 — Likes */}
            <View style={styles.statsCol}>
              <Text style={[styles.statsNum, { color: C.onSurface }]}>{announce.likes_count ?? 0}</Text>
              <Text style={[styles.statsSub, { color: C.onSurfaceVariant }]}>favoris</Text>
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />

          {/* ── Host row (Airbnb "Stay with Rosa") ── */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Voir le profil de ${displayName}`}
            onPress={() => router.push(`/announcers/${announce.announcer?.id}`)}
            style={styles.hostRow}
          >
            {/* Avatar */}
            <View style={[styles.hostAvatar, { borderColor: C.outlineVariant }]}>
              {announce.announcer?.avatar ? (
                <Image
                  source={{ uri: announce.announcer.avatar }}
                  style={styles.hostAvatarImg}
                />
              ) : (
                <View
                  style={[
                    styles.hostAvatarImg,
                    { backgroundColor: C.primaryFixed, alignItems: 'center', justifyContent: 'center' },
                  ]}
                >
                  <MaterialIcons name="person" size={24} color={C.primary} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hostName, { color: C.onSurface }]}>Annoncé par {displayName}</Text>
              <Text style={[styles.hostSub, { color: C.onSurfaceVariant }]}>
                Certifié{announcerListingsCount > 0 ? ` · ${announcerListingsCount} annonce${announcerListingsCount > 1 ? 's' : ''}` : ''}
              </Text>
            </View>
          </Pressable>

          {/* ── Divider ── */}
          <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />

          {/* ── Feature highlights ── */}
          <View style={styles.feature}>
            <MaterialIcons name="verified-user" size={28} color={C.onSurface} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: C.onSurface }]}>Contact sécurisé</Text>
              <Text style={[styles.featureSub, { color: C.onSurfaceVariant }]}>
                {announce.unlocked
                  ? "Vous avez accès aux coordonnées de l'annonceur."
                  : "Débloquez pour accéder aux coordonnées de l'annonceur."}
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <MaterialIcons name="location-on" size={28} color={C.onSurface} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: C.onSurface }]}>{announce.city}</Text>
              <Text style={[styles.featureSub, { color: C.onSurfaceVariant }]}>
                {announce.address}
                {announce.state ? `, ${announce.state}` : ''}
              </Text>
            </View>
          </View>

          {/* ── Banner ── */}
          <View style={[styles.banner, { backgroundColor: C.surfaceContainer }]}>
            <MaterialIcons name="diamond" size={16} color={C.onSurfaceVariant} />
            <Text style={[styles.bannerText, { color: C.onSurfaceVariant }]}>
              {announce.ad_type === 'location'
                ? 'Bien disponible à la location'
                : 'Bien disponible à la vente'}
            </Text>
          </View>

          {/* ── Divider ── */}
          <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />

          {/* ── Description ── */}
          <View style={styles.section}>
            <Text style={[styles.descText, { color: C.onSurface }]} numberOfLines={expanded ? undefined : 3}>
              {announce.description}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              hitSlop={8}
              onPress={() => setExpanded((v) => !v)}
              style={styles.expandRow}
            >
              <Text style={[styles.expandLink, { color: C.onSurface }]}>
                {expanded ? 'Afficher moins' : 'Afficher plus'}
              </Text>
              <MaterialIcons
                name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={18}
                color={C.onSurface}
              />
            </Pressable>
          </View>

          {/* ── Amenities ── */}
          {announce.type === 'realestate' && activeAmenities.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: C.onSurface }]}>Ce que propose ce bien</Text>
                {visibleAmenities.map((a) => (
                  <View key={a.key} style={styles.amenityRow}>
                    <MaterialIcons name={a.icon} size={22} color={C.onSurface} />
                    <Text style={[styles.amenityLabel, { color: C.onSurface }]}>{a.label}</Text>
                  </View>
                ))}
                {activeAmenities.length > 5 && (
                  <Button
                    mode="outlined"
                    onPress={() => setShowAllAmenities((v) => !v)}
                    style={styles.showAllBtn}
                    textColor={C.onSurface}
                  >
                    {showAllAmenities
                      ? 'Afficher moins'
                      : `Afficher les ${activeAmenities.length} équipements`}
                  </Button>
                )}
              </View>
            </>
          )}

          {/* ── Announcer card ── */}
          <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.onSurface }]}>L'annonceur</Text>
            <AnnouncerCard
              announcer={announce.announcer}
              announcesCount={announcerListingsCount}
              onPress={() => router.push(`/announcers/${announce.announcer?.id}`)}
            />
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom bar (Airbnb style) ── */}
      <View
        style={[
          styles.bottomBar,
          { borderTopColor: C.outlineVariant, backgroundColor: C.surface, paddingBottom: insets.bottom + 12 },
        ]}
      >
        {/* Left — price underlined + period */}
        <View style={styles.bottomLeft}>
          <Text style={[styles.bottomPrice, { color: C.onSurface }]}>
            {announce.price.toLocaleString('fr-FR')} {announce.devise}
          </Text>
          <Text style={[styles.bottomPeriod, { color: C.onSurfaceVariant }]}>
            {announce.ad_type === 'location' ? 'par mois' : 'prix de vente'}
          </Text>
        </View>

        {/* Right — pill CTA */}
        <Button
          mode="contained"
          accessibilityLabel={announce.unlocked ? "Contacter l'annonceur" : 'Débloquer les coordonnées'}
          onPress={handleUnlock}
          style={styles.ctaPill}
          contentStyle={styles.ctaContent}
          labelStyle={styles.ctaText}
        >
          {announce.unlocked ? 'Contacter' : 'Débloquer'}
        </Button>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Gallery buttons
  backBtn: {
    position: 'absolute',
    left: 16,
    margin: 0,
  },
  topActions: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  iconBtn: {
    margin: 0,
  },

  // Content card
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 28,
  },

  // Title area
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: Spacing.marginMobile,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: Spacing.marginMobile,
    marginBottom: 2,
  },

  // Stats box (3-col bordered)
  statsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.marginMobile,
    marginTop: 20,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statsCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  statsLine: {
    width: 1,
    height: 44,
  },
  statsNum: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    lineHeight: 22,
  },
  statsSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  statsBold: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: 8,
  },

  // Host row
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: 16,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    flexShrink: 0,
    borderWidth: 1.5,
  },
  hostAvatarImg: { width: '100%', height: '100%' },
  hostName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    lineHeight: 20,
  },
  hostSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    marginTop: 2,
  },

  // Features (Airbnb "Great check-in experience")
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: 14,
  },
  featureTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    lineHeight: 20,
  },
  featureSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: 12,
  },
  bannerText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: 16,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },

  // Description
  descText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  expandLink: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Amenities
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  amenityLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
  },
  showAllBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderRadius: 10,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 16,
  },
  bottomLeft: {
    flex: 1,
    gap: 2,
  },
  bottomPrice: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    textDecorationLine: 'underline',
  },
  bottomPeriod: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
  },
  ctaPill: {
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  ctaContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
  },
});
