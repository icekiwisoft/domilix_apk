import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ListingGallery } from '@/components/listing/listing-gallery';
import { ListingPriceTag } from '@/components/listing/listing-price-tag';
import { ListingStatsRow } from '@/components/listing/listing-stats-row';
import { ListingAmenities } from '@/components/listing/listing-amenities';
import { ListingActionsBar } from '@/components/listing/listing-actions-bar';
import { AnnouncerCard } from '@/components/announcer/announcer-card';
import { AnnounceDetailSkeleton } from '@/components/listing/announce-detail-skeleton';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnounce, useToggleLike, useUnlockAnnounce } from '@/hooks/queries/use-announces';
import { useAnnounces } from '@/hooks/queries/use-announces';

export default function AnnounceDetailScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: announce, isLoading, isFetching, refetch } = useAnnounce(id ?? '');
  const { data: announcerListingsData } = useAnnounces(
    announce ? { AnnouncerId: announce.announcer_id } : {}
  );
  const toggleLike = useToggleLike();
  const unlockAnnounce = useUnlockAnnounce();

  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <AnnounceDetailSkeleton onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!announce) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, padding: Spacing.lg }]}>
          Annonce introuvable.
        </Text>
      </SafeAreaView>
    );
  }

  const announcerListingsCount = (announcerListingsData?.data ?? [])
    .filter((a) => a.id !== announce.id).length;

  const badge =
    announce.category?.name === 'Exclusivité'
      ? 'exclusivite'
      : (Date.now() - new Date(announce.creation_date).getTime() < 7 * 86400_000 ? 'nouveau' : null);

  function handleUnlock() {
    if (!announce!.unlocked) {
      router.push({ pathname: '/(modals)/unlock-confirm', params: { announceId: announce!.id } });
    }
  }

  function handleShare() {
    // Native share placeholder
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {/* Gallery */}
        <View style={styles.galleryWrapper}>
          <ListingGallery medias={announce.medias} height={300} announceId={announce.id} />

          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.fabBtn, styles.backBtn, { backgroundColor: C.surface + 'CC' }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
          </Pressable>

          {/* Like */}
          <Pressable
            onPress={() => toggleLike.mutate(announce.id)}
            style={[styles.fabBtn, styles.likeBtn, { backgroundColor: C.surface + 'CC' }]}
          >
            <MaterialIcons
              name={announce.liked ? 'favorite' : 'favorite-border'}
              size={22}
              color={announce.liked ? C.error : C.onSurface}
            />
          </Pressable>
        </View>

        <View style={styles.body}>
          {/* Badge + title */}
          {badge && (
            <View style={[
              styles.typeBadge,
              {
                backgroundColor: badge === 'exclusivite' ? C.tertiaryContainer + 'E6' : C.surfaceContainerLowest + 'E6',
                borderColor: badge === 'exclusivite' ? C.onTertiaryContainer + '33' : C.outlineVariant,
              },
            ]}>
              <Text style={[Typography.caption, { color: badge === 'exclusivite' ? C.onTertiaryContainer : C.onSurface, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 0.8, textTransform: 'uppercase' }]}>
                {badge === 'exclusivite' ? 'Exclusivité' : 'Nouveau'}
              </Text>
            </View>
          )}

          <View style={styles.titleRow}>
            <Text style={[Typography.headlineLg, styles.titleText, { color: C.onSurface }]} numberOfLines={2}>
              {announce.description.split('.')[0]}
            </Text>
          </View>

          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={16} color={C.onSurfaceVariant} />
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, flex: 1 }]}>
              {announce.address}, {announce.city}
            </Text>
          </View>

          {/* Price */}
          <View style={[styles.priceBox, { backgroundColor: C.primaryContainer + '1A', borderColor: C.primaryContainer + '33' }]}>
            <Text style={[Typography.caption, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }]}>
              {announce.ad_type === 'location' ? 'Loyer Mensuel' : 'Prix de vente'}
            </Text>
            <ListingPriceTag price={announce.price} devise={announce.devise} period={announce.period} size="lg" />
          </View>

          {/* Stats */}
          {announce.type === 'realestate' && (announce.bedrooms != null || announce.size != null) && (
            <ListingStatsRow
              bedrooms={announce.bedrooms}
              size={announce.size}
            />
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: C.outlineVariant + '4D' }]} />

          {/* Description */}
          <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20, marginBottom: Spacing.md }]}>
            À propos de ce bien
          </Text>
          <Pressable onPress={() => setExpanded((v) => !v)}>
            <Text
              style={[Typography.bodyLg, { color: C.onSurfaceVariant, lineHeight: 28 }]}
              numberOfLines={expanded ? undefined : 4}
            >
              {announce.description}
            </Text>
            <Text style={[Typography.labelSm, { color: C.primary, marginTop: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              {expanded ? 'Voir moins' : 'Lire la suite'}
            </Text>
          </Pressable>

          {/* Amenities */}
          {announce.type === 'realestate' && (
            <>
              <View style={[styles.divider, { backgroundColor: C.outlineVariant + '4D' }]} />
              <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20, marginBottom: Spacing.md }]}>
                Équipements & Prestations
              </Text>
              <ListingAmenities announce={announce} />
            </>
          )}

          {/* Announcer */}
          <View style={[styles.divider, { backgroundColor: C.outlineVariant + '4D' }]} />
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.12, marginBottom: Spacing.md }]}>
            Proposé par
          </Text>
          <AnnouncerCard
            announcer={announce.announcer}
            announcesCount={announcerListingsCount}
            onPress={() => router.push(`/announcers/${announce.announcer_id}`)}
          />
        </View>

        {/* Space for the sticky bar */}
        <View style={{ height: 96 }} />
      </ScrollView>

      <ListingActionsBar
        unlocked={announce.unlocked}
        onShare={handleShare}
        onUnlock={handleUnlock}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {},
  galleryWrapper: {
    position: 'relative',
  },
  fabBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  backBtn: {
    top: Spacing.md,
    left: Spacing.md,
  },
  likeBtn: {
    top: Spacing.md,
    right: Spacing.md,
  },
  body: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  titleRow: {},
  titleText: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -Spacing.sm,
  },
  priceBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
