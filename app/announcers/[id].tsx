import { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ListingCard } from '@/components/listing/listing-card';
import { AnnouncerDetailSkeleton } from '@/components/announcer/announcer-detail-skeleton';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { useAnnounces } from '@/hooks/queries/use-announces';

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
  const { data: listingsData } = useAnnounces(id ? { AnnouncerId: id } : {});

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <AnnouncerDetailSkeleton onBack={() => router.back()} />;
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (!announcer) {
    return (
      <View style={[s.root, { backgroundColor: C.background }]}>
        <Pressable
          onPress={() => router.back()}
          style={[
            s.backFloating,
            { backgroundColor: C.surface + 'CC', top: insets.top + 8 },
          ]}
        >
          <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
        </Pressable>
        <View style={s.errorBody}>
          <MaterialIcons name="person-off" size={52} color={C.onSurfaceVariant + '88'} />
          <Text style={[s.errorTitle, { color: C.onSurface }]}>Profil introuvable</Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center' }]}>
            Ce profil n'existe pas ou n'est plus disponible.
          </Text>
          <Pressable onPress={() => router.back()} style={[s.errorBtn, { backgroundColor: C.primary }]}>
            <MaterialIcons name="arrow-back" size={16} color={C.onPrimary} />
            <Text style={[Typography.labelSm, { color: C.onPrimary }]}>Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const listings = listingsData?.data ?? [];
  const totalListings =
    (listingsData?.total ?? ((announcer.houses ?? 0) + (announcer.furnitures ?? 0))) ||
    listings.length;
  const allMedias = listings.flatMap((a) => a.medias);
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

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <ScrollView
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
        {/* ── Cover ─────────────────────────────────────────────────────────── */}
        <View style={[s.cover, { backgroundColor: C.primary }]}>
          <View style={[s.coverOverlay, { backgroundColor: '#00000022' }]} />
          <Pressable
            onPress={() => router.back()}
            style={[s.backFloating, { backgroundColor: '#00000033', top: insets.top + 8 }]}
          >
            <MaterialIcons name="arrow-back" size={22} color="#fff" />
          </Pressable>
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
              <Pressable
                onPress={() => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`)}
                style={({ pressed }) => [
                  s.ctaBtn,
                  s.ctaBtnOutline,
                  { borderColor: C.outlineVariant, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <MaterialIcons name="chat" size={18} color={C.onSurface} />
                <Text style={[s.ctaLabel, { color: C.onSurface }]}>WhatsApp</Text>
              </Pressable>
              <Pressable
                onPress={() => Linking.openURL(`tel:${phone}`)}
                style={({ pressed }) => [
                  s.ctaBtn,
                  { backgroundColor: C.primary, opacity: pressed ? 0.88 : 1 },
                ]}
              >
                <MaterialIcons name="call" size={18} color={C.onPrimary} />
                <Text style={[s.ctaLabel, { color: C.onPrimary }]}>Appeler</Text>
              </Pressable>
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
          <View style={[s.tabPills, { backgroundColor: C.surfaceContainerLow }]}>
            {(['annonces', 'medias', 'about'] as TabName[]).map((tab) => {
              const active = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[s.tabPill, active && { backgroundColor: C.primary }]}
                >
                  <Text style={[s.tabLabel, { color: active ? '#fff' : C.onSurfaceVariant }]}>
                    {tab === 'annonces' ? 'Annonces' : tab === 'medias' ? 'Médias' : 'À propos'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <View style={[s.content, { paddingHorizontal: Spacing.marginMobile }]}>

          {/* Annonces */}
          {activeTab === 'annonces' && (
            <>
              <View
                style={[
                  s.searchBar,
                  { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant },
                ]}
              >
                <MaterialIcons name="search" size={20} color={C.onSurfaceVariant} />
                <TextInput
                  style={[s.searchInput, { color: C.onSurface }]}
                  placeholder="Rechercher une annonce..."
                  placeholderTextColor={C.onSurfaceVariant + '99'}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={6}>
                    <MaterialIcons name="close" size={18} color={C.onSurfaceVariant} />
                  </Pressable>
                )}
              </View>

              {filteredListings.length === 0 ? (
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

              {allMedias.length === 0 ? (
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    height: 48,
    borderRadius: Radius.md,
  },

  // ── Back button ──
  backFloating: {
    position: 'absolute',
    left: Spacing.marginMobile,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  ctaBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  ctaBtnOutline: { borderWidth: 1 },
  ctaLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, letterSpacing: 0.3 },

  // ── Tabs ──
  tabsWrap: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  tabPills: {
    flexDirection: 'row',
    borderRadius: 100,
    padding: 4,
    alignSelf: 'flex-start',
  },
  tabPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 100,
  },
  tabLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, lineHeight: 18 },

  // ── Content ──
  content: { paddingTop: Spacing.lg },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    paddingVertical: 0,
  },

  // Empty state
  emptyState: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, lineHeight: 24 },

  // Listings
  listingsCol: { gap: Spacing.md },

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
