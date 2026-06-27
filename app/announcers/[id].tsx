import { useRef, useState } from 'react';
import { Image, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncerHero } from '@/components/announcer/announcer-hero';
import { AnnouncerStats } from '@/components/announcer/announcer-stats';
import { AnnouncerContact } from '@/components/announcer/announcer-contact';
import { ListingCard } from '@/components/listing/listing-card';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { AnnouncerDetailSkeleton } from '@/components/announcer/announcer-detail-skeleton';
import { useAnnounces } from '@/hooks/queries/use-announces';

type TabName = 'annonces' | 'medias';

export default function AnnouncerProfileScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabName>('annonces');
  const scrollRef = useRef<ScrollView>(null);

  const { data: announcer, isLoading, isFetching, refetch } = useAnnouncer(id ?? '');
  const { data: listingsData } = useAnnounces(id ? { AnnouncerId: id } : {});

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <AnnouncerDetailSkeleton onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!announcer) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: C.surface + 'CC', top: Spacing.md, left: Spacing.md }]}
        >
          <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
        </Pressable>
        <View style={styles.errorState}>
          <MaterialIcons name="person-off" size={52} color={C.onSurfaceVariant + '88'} />
          <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18, textAlign: 'center', marginTop: Spacing.md }]}>
            Profil introuvable
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 }]}>
            Ce profil n'existe pas ou n'est plus disponible.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.errorBtn, { backgroundColor: C.primary }]}
          >
            <MaterialIcons name="arrow-back" size={16} color={C.onPrimary} />
            <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Retour
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const listings = listingsData?.data ?? [];
  const totalListings = listingsData?.total
    ?? ((announcer.houses ?? 0) + (announcer.furnitures ?? 0))
    || listings.length;
  const allMedias = listings.flatMap((a) => a.medias);

  const phone = announcer.professional_phone ?? announcer.contact;

  function handleContact() {
    if (!phone) return;
    const digits = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${digits}`);
  }

  function handleViewListings() {
    setActiveTab('annonces');
    scrollRef.current?.scrollTo({ y: 420, animated: true });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: C.surface + 'CC' }]}
        >
          <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
        </Pressable>

        {/* Hero section */}
        <View style={[styles.heroSection, { backgroundColor: C.surfaceContainerLow }]}>
          <AnnouncerHero
            announcer={announcer}
            announcesCount={totalListings}
            verified={announcer.verified}
            onContact={handleContact}
            onViewListings={handleViewListings}
          />
          <View style={[styles.contactWrapper, { paddingBottom: Spacing.xl }]}>
            <AnnouncerContact announcer={announcer} />
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: C.outlineVariant }]}>
          {(['annonces', 'medias'] as TabName[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn,
                activeTab === tab && [styles.tabActive, { borderBottomColor: C.primary }],
              ]}
            >
              <Text
                style={[
                  Typography.labelSm,
                  {
                    color: activeTab === tab ? C.primary : C.onSurfaceVariant,
                    textTransform: 'uppercase',
                    letterSpacing: 1.12,
                  },
                ]}
              >
                {tab === 'annonces' ? 'Annonces' : 'Médias'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.content}>
          {activeTab === 'annonces' ? (
            listings.length === 0 ? (
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', padding: Spacing.xl }]}>
                Aucune annonce publiée.
              </Text>
            ) : (
              <View style={styles.grid}>
                {listings.map((a, i) => (
                  <View key={a.id} style={[styles.gridItem, i === 0 && styles.gridFeatured]}>
                    <ListingCard
                      announce={a}
                      onPress={() => router.push(`/announces/${a.id}`)}
                    />
                  </View>
                ))}
              </View>
            )
          ) : (
            <View style={styles.mediaGrid}>
              {allMedias.map((m) => (
                <View key={m.id} style={styles.mediaThumb}>
                  <Image source={{ uri: m.file }} style={styles.mediaImg} resizeMode="cover" />
                </View>
              ))}
              {allMedias.length === 0 && (
                <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', padding: Spacing.xl }]}>
                  Aucun média disponible.
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {},
  backBtn: {
    position: 'absolute',
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
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
  heroSection: {
    paddingTop: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  contactWrapper: {
    paddingHorizontal: Spacing.marginMobile,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: Spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  content: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
  },
  grid: {
    gap: Spacing.md,
  },
  gridItem: {},
  gridFeatured: {},
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  mediaThumb: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  mediaImg: { width: '100%', height: '100%' },
});
