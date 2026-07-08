import { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityIndicator, Button, IconButton, SegmentedButtons } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ListingCard } from '@/components/listing/listing-card';
import { ListingSkeleton } from '@/components/listing/listing-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchBar } from '@/components/search/search-bar';
import { AnnouncerDetailSkeleton } from '@/components/announcer/announcer-detail-skeleton';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { useInfiniteAnnounces } from '@/hooks/queries/use-announces';

const PAGINATION_THRESHOLD = 400;

type TabName = 'annonces' | 'medias' | 'about';

const COVER_H = 180;
const AVATAR_SIZE = 84;
const AVATAR_BORDER = 3;
const CARD_RADIUS = 28;
const CARD_OVERLAP = 32;

// ── StatPill ──────────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: number; label: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={statS.col}>
      <Text style={[statS.value, { color: C.primary }]}>{value}</Text>
      <Text style={[statS.label, { color: C.onSurfaceVariant }]}>{label}</Text>
    </View>
  );
}
const statS = StyleSheet.create({
  col: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, lineHeight: 28 },
  label: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, lineHeight: 16 },
});

// ── ContactInfoCard ───────────────────────────────────────────────────────────

function ContactInfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
}) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={[ctS.card, { backgroundColor: C.surfaceContainerLow }]}>
      <View style={[ctS.icon, { backgroundColor: C.primaryContainer }]}>
        <MaterialIcons name={icon} size={18} color={C.primary} />
      </View>
      <View style={ctS.text}>
        <Text style={[ctS.label, { color: C.onSurfaceVariant }]}>{label}</Text>
        <Text style={[ctS.value, { color: C.onSurface }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
const ctS = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: { flex: 1, minWidth: 0 },
  label: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, lineHeight: 16, marginBottom: 2 },
  value: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, lineHeight: 20 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AnnouncerProfileScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabName>('annonces');
  const [search, setSearch] = useState('');

  const { data: announcer, isLoading, isFetching, refetch } = useAnnouncer(id ?? '');
  const {
    data: listingsPages,
    isLoading: listingsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchListings,
  } = useInfiniteAnnounces({ AnnouncerId: id ?? '' }, { enabled: !!id });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <AnnouncerDetailSkeleton onBack={() => router.back()} />;
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (!announcer) {
    return (
      <View style={[s.root, { backgroundColor: C.background }]}>
        <IconButton
          icon="arrow-left"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          iconColor={C.onSurface}
          containerColor={C.surface + 'CC'}
          size={22}
          style={[s.backFloating, { top: insets.top + 8 }]}
        />
        <View style={s.errorBody}>
          <MaterialIcons name="person-off" size={52} color={C.onSurfaceVariant + '88'} />
          <Text style={[s.errorTitle, { color: C.onSurface }]}>Profil introuvable</Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center' }]}>
            Ce profil n'existe pas ou n'est plus disponible.
          </Text>
          <Button mode="contained" icon="arrow-left" onPress={() => router.back()} style={s.errorBtn}>
            Retour
          </Button>
        </View>
      </View>
    );
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const listings = useMemo(
    () => listingsPages?.pages.flatMap((p) => p.data) ?? [],
    [listingsPages],
  );
  const totalListings =
    (listingsPages?.pages[0]?.meta.total ?? ((announcer.houses ?? 0) + (announcer.furnitures ?? 0))) ||
    listings.length;
  const allMedias = useMemo(() => listings.flatMap((a) => a.medias), [listings]);
  const filteredListings = search.trim()
    ? listings.filter(
        (a) =>
          a.description?.toLowerCase().includes(search.toLowerCase()) ||
          a.city?.toLowerCase().includes(search.toLowerCase()),
      )
    : listings;

  const phone = announcer.professional_phone ?? announcer.contact;
  const displayName = announcer.company_name ?? announcer.name;
  const memberYear = announcer.creation_date
    ? new Date(announcer.creation_date).getFullYear()
    : null;

  function handleRefresh() {
    refetch();
    refetchListings();
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (activeTab === 'about' || !hasNextPage || isFetchingNextPage) return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    if (distanceFromBottom < PAGINATION_THRESHOLD) {
      fetchNextPage();
    }
  }

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {/* ── Cover ─────────────────────────────────────────────────────────── */}
        <View style={[s.cover, { backgroundColor: C.primary }]}>
          <View style={[s.coverOverlay, { backgroundColor: '#00000022' }]} />
          <IconButton
            icon="arrow-left"
            accessibilityLabel="Retour"
            onPress={() => router.back()}
            iconColor="#fff"
            containerColor="#00000033"
            size={22}
            style={[s.backFloating, { top: insets.top + 8 }]}
          />
        </View>

        {/* ── Profile card ──────────────────────────────────────────────────── */}
        <View style={[s.profileCard, { backgroundColor: C.surface }]}>
          {/* Avatar + identity */}
          <View style={s.avatarRow}>
            <View style={[s.avatarWrap, { borderColor: C.surface }]}>
              {announcer.avatar ? (
                <Image
                  source={{ uri: announcer.avatar }}
                  style={s.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[s.avatarImg, s.avatarFallback, { backgroundColor: C.surfaceContainerLow }]}
                >
                  <MaterialIcons name="person" size={40} color={C.onSurfaceVariant} />
                </View>
              )}
            </View>

            <View style={s.identityCol}>
              <View style={s.nameRow}>
                <Text style={[s.name, { color: C.onSurface }]} numberOfLines={2}>
                  {displayName}
                </Text>
                {announcer.verified && (
                  <MaterialIcons name="verified" size={18} color={C.primary} />
                )}
              </View>
              {!!memberYear && (
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                  Membre depuis {memberYear}
                </Text>
              )}
              {announcer.verified && (
                <View style={s.verifiedRow}>
                  <View style={s.verifiedDot} />
                  <Text style={[Typography.caption, { color: '#16a34a' }]}>Vérifié</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bio preview */}
          {!!announcer.bio && (
            <Text style={[s.bioPreview, { color: C.onSurfaceVariant }]} numberOfLines={2}>
              {announcer.bio}
            </Text>
          )}

          {/* Stats */}
          <View style={[s.statsRow, { borderTopColor: C.outlineVariant }]}>
            <StatPill value={announcer.furnitures ?? 0} label="Meubles" />
            <View style={[s.statSep, { backgroundColor: C.outlineVariant }]} />
            <StatPill value={announcer.houses ?? 0} label="Maisons" />
            <View style={[s.statSep, { backgroundColor: C.outlineVariant }]} />
            <StatPill value={totalListings} label="Annonces" />
          </View>

          {/* CTA buttons */}
          {!!phone && (
            <View style={s.ctaRow}>
              <Button
                mode="outlined"
                icon="whatsapp"
                onPress={() => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`)}
                style={s.ctaBtn}
              >
                WhatsApp
              </Button>
              <Button
                mode="contained"
                icon="phone"
                onPress={() => Linking.openURL(`tel:${phone}`)}
                style={s.ctaBtn}
              >
                Appeler
              </Button>
            </View>
          )}
        </View>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <View
          style={[
            s.tabsWrap,
            { backgroundColor: C.surface, borderBottomColor: C.outlineVariant },
          ]}
        >
          <SegmentedButtons
            style={s.tabPills}
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabName)}
            buttons={[
              { value: 'annonces', label: 'Annonces' },
              { value: 'medias', label: 'Médias' },
              { value: 'about', label: 'À propos' },
            ]}
          />
        </View>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <View style={[s.content, { paddingHorizontal: Spacing.marginMobile }]}>

          {/* Annonces */}
          {activeTab === 'annonces' && (
            <>
              <View style={s.searchBarWrap}>
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Rechercher une annonce..."
                />
              </View>

              {listingsLoading ? (
                <View style={s.listingsCol}>
                  {[1, 2, 3].map((k) => <ListingSkeleton key={k} />)}
                </View>
              ) : filteredListings.length === 0 ? (
                <View style={s.emptyState}>
                  <MaterialIcons name="home-work" size={40} color={C.onSurfaceVariant + '66'} />
                  <Text style={[s.emptyTitle, { color: C.onSurface }]}>
                    {search ? 'Aucun résultat' : 'Aucune annonce'}
                  </Text>
                  <Text
                    style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center' }]}
                  >
                    {search
                      ? 'Essayez avec un autre mot-clé.'
                      : "Cet annonceur n'a pas encore publié d'annonce."}
                  </Text>
                </View>
              ) : (
                <View style={s.listingsCol}>
                  {filteredListings.map((a) => (
                    <ListingCard
                      key={a.id}
                      announce={a}
                      onPress={() => router.push(`/announces/${a.id}`)}
                    />
                  ))}
                  {isFetchingNextPage && <ActivityIndicator style={s.paginationLoader} />}
                </View>
              )}
            </>
          )}

          {/* Médias */}
          {activeTab === 'medias' && (
            <>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTag, { color: C.primary }]}>GALERIE ANNONCEUR</Text>
                <Text style={[s.sectionTitle, { color: C.onSurface }]}>Médias publiés</Text>
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                  {allMedias.length} média{allMedias.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {listingsLoading ? (
                <View style={s.mediaGrid}>
                  {[1, 2, 3, 4].map((k) => (
                    <View key={k} style={[s.mediaThumb, { backgroundColor: C.surfaceContainerLow }]}>
                      <Skeleton style={StyleSheet.absoluteFillObject} radius={0} />
                    </View>
                  ))}
                </View>
              ) : allMedias.length === 0 ? (
                <View style={s.emptyState}>
                  <MaterialIcons
                    name="photo-library"
                    size={40}
                    color={C.onSurfaceVariant + '66'}
                  />
                  <Text style={[s.emptyTitle, { color: C.onSurface }]}>Aucun média</Text>
                  <Text
                    style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center' }]}
                  >
                    Les photos des annonces apparaîtront ici.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={s.mediaGrid}>
                    {allMedias.map((m, idx) => (
                      <View
                        key={m.id ?? String(idx)}
                        style={[s.mediaThumb, { backgroundColor: C.surfaceContainerLow }]}
                      >
                        <Image
                          source={{ uri: m.thumbnail ?? m.file }}
                          style={s.mediaImg}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </View>
                  {isFetchingNextPage && <ActivityIndicator style={s.paginationLoader} />}
                </>
              )}
            </>
          )}

          {/* À propos */}
          {activeTab === 'about' && (
            <View style={s.aboutSection}>
              <View
                style={[
                  s.aboutCard,
                  { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant },
                ]}
              >
                <Text style={[s.aboutCardTitle, { color: C.onSurface }]}>Biographie</Text>
                <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 22 }]}>
                  {announcer.bio || 'Aucune biographie disponible pour cet annonceur.'}
                </Text>
              </View>

              <View
                style={[
                  s.aboutCard,
                  { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant },
                ]}
              >
                <Text style={[s.aboutCardTitle, { color: C.onSurface }]}>
                  Informations de contact
                </Text>
                <View style={s.contactCards}>
                  {!!announcer.email && (
                    <ContactInfoCard icon="email" label="Email" value={announcer.email} />
                  )}
                  {!!phone && (
                    <ContactInfoCard icon="phone" label="Téléphone" value={phone} />
                  )}
                  <ContactInfoCard
                    icon={announcer.verified ? 'verified' : 'radio-button-unchecked'}
                    label="Statut"
                    value={announcer.verified ? 'Compte vérifié' : 'Non vérifié'}
                  />
                  {!!memberYear && (
                    <ContactInfoCard
                      icon="calendar-today"
                      label="Membre depuis"
                      value={new Date(announcer.creation_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    />
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={{ height: Spacing.xxl + (insets.bottom || 0) }} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  // ── Error ──
  errorBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  errorTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  errorBtn: {
    marginTop: Spacing.lg,
  },

  // ── Back button ──
  backFloating: {
    position: 'absolute',
    left: Spacing.marginMobile,
    margin: 0,
    zIndex: 10,
  },

  // ── Cover ──
  cover: { height: COVER_H, overflow: 'hidden' },
  coverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  // ── Profile card ──
  profileCard: {
    marginTop: -CARD_OVERLAP,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    paddingHorizontal: Spacing.marginMobile,
    paddingBottom: Spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginTop: -(AVATAR_SIZE / 2 + AVATAR_BORDER),
    marginBottom: Spacing.md,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: AVATAR_BORDER,
    overflow: 'hidden',
    flexShrink: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  identityCol: { flex: 1, paddingBottom: 4, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  name: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, lineHeight: 24, flexShrink: 1 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  bioPreview: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: Spacing.md,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  statSep: { width: 1, height: 32 },

  // ── CTA ──
  ctaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  ctaBtn: { flex: 1 },

  // ── Tabs ──
  tabsWrap: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  tabPills: {
    alignSelf: 'flex-start',
  },

  // ── Content ──
  content: { paddingTop: Spacing.lg },

  // Search
  searchBarWrap: { marginBottom: Spacing.lg },

  // Empty state
  emptyState: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, lineHeight: 24 },

  // Listings
  listingsCol: { gap: Spacing.md },
  paginationLoader: { marginTop: Spacing.lg },

  // Media gallery
  sectionHeader: { marginBottom: Spacing.md, gap: 3 },
  sectionTag: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, lineHeight: 28 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  mediaThumb: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  mediaImg: { width: '100%', height: '100%' },

  // About
  aboutSection: { gap: Spacing.lg },
  aboutCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  aboutCardTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, lineHeight: 22 },
  contactCards: { gap: Spacing.sm },
});
