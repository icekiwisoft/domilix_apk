import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
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
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, padding: Spacing.lg }]}>
          Profil introuvable.
        </Text>
      </SafeAreaView>
    );
  }

  const listings = listingsData?.data ?? [];
  const allMedias = listings.flatMap((a) => a.medias).slice(0, 12);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <ScrollView
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
            announcesCount={listings.length}
            rating={4.8}
            viewsPerMonth={12000}
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
    top: Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
