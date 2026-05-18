import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BroadcastBanner } from '@/components/home/broadcast-banner';
import { CategoryPills } from '@/components/home/category-pills';
import { SectionHeader } from '@/components/home/section-header';
import { SearchBar } from '@/components/search/search-bar';
import { ListingCard } from '@/components/listing/listing-card';
import { ListingCardH } from '@/components/listing/listing-card-h';
import { ListingSkeleton } from '@/components/listing/listing-skeleton';
import { useAnnounces } from '@/hooks/queries/use-announces';
import { useBroadcasts } from '@/hooks/queries/use-broadcasts';
import { useCategories } from '@/hooks/queries/use-categories';
import { useMe } from '@/hooks/queries/use-auth-queries';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { data: me } = useMe();
  const { data: broadcastsData, isLoading: broadcastsLoading } = useBroadcasts();
  const { data: categoriesData } = useCategories();
  const { data: recentData, isLoading: recentLoading } = useAnnounces({ type: 'realestate', page: 1 });
  const { data: furnitureData, isLoading: furnitureLoading } = useAnnounces({ type: 'furniture', page: 1 });

  const broadcast = broadcastsData?.[0];
  const categories = categoriesData?.data ?? [];
  const recent = recentData?.data.slice(0, 4) ?? [];
  const furniture = furnitureData?.data.slice(0, 6) ?? [];

  function handleSearch() {
    if (search.trim()) {
      router.push({ pathname: '/(tabs)/explore', params: { q: search.trim() } });
    }
  }

  function handleFilterPress() {
    router.push('/(modals)/filter-sheet');
  }

  function handleCardPress(id: string) {
    router.push(`/announces/${id}`);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant }]}>
        <View style={styles.location}>
          <MaterialIcons name="location-on" size={18} color={C.primary} />
          <View>
            <Text style={[Typography.caption, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Localisation
            </Text>
            <View style={styles.locationRow}>
              <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
                Douala
              </Text>
              <MaterialIcons name="expand-more" size={16} color={C.onSurface} />
            </View>
          </View>
        </View>

        <Text style={[Typography.headlineMd, styles.logo, { color: C.primary }]}>Domilix</Text>

        <Pressable
          onPress={() => me?.announcer ? router.push(`/announcers/${me.announcer.id}`) : undefined}
          style={[styles.avatar, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }]}
        >
          {me?.announcer?.avatar ? (
            <Image source={{ uri: me.announcer.avatar }} style={styles.avatarImg} />
          ) : (
            <MaterialIcons name="person" size={20} color={C.onSurfaceVariant} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.section}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={handleFilterPress}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Broadcast banner */}
        {broadcast && (
          <View style={styles.section}>
            <BroadcastBanner broadcast={broadcast} onPress={() => router.push('/(tabs)/explore')} />
          </View>
        )}

        {/* Category pills */}
        <View style={[styles.section, { paddingHorizontal: 0, paddingLeft: Spacing.marginMobile }]}>
          <CategoryPills
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
          />
        </View>

        {/* Récents */}
        <View style={styles.section}>
          <SectionHeader
            title="Récents à Douala"
            onSeeAll={() => router.push('/(tabs)/explore')}
          />
        </View>
        {recentLoading ? (
          <View style={[styles.listContent, { gap: Spacing.md }]}>
            {[1, 2].map((k) => <ListingSkeleton key={k} />)}
          </View>
        ) : (
          <FlatList
            data={recent}
            keyExtractor={(a) => a.id}
            renderItem={({ item }) => (
              <ListingCard
                announce={item}
                onPress={() => handleCardPress(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
            contentContainerStyle={[styles.listContent, { paddingBottom: 0 }]}
            scrollEnabled={false}
          />
        )}

        {/* Mobilier populaire */}
        <View style={[styles.section, { marginTop: Spacing.xl }]}>
          <SectionHeader
            title="Mobilier populaire"
            onSeeAll={() => router.push({ pathname: '/(tabs)/explore', params: { type: 'furniture' } })}
          />
        </View>
        {furnitureLoading ? (
          <ActivityIndicator color={C.primary} style={{ marginBottom: Spacing.lg }} />
        ) : (
          <FlatList
            data={furniture}
            keyExtractor={(a) => a.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.furnitureCard}>
                <ListingCardH
                  announce={item}
                  onPress={() => handleCardPress(item.id)}
                />
              </View>
            )}
            contentContainerStyle={styles.furnitureList}
            scrollEnabled
          />
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logo: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  scroll: {
    paddingTop: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.marginMobile,
    marginBottom: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.marginMobile,
  },
  furnitureList: {
    paddingLeft: Spacing.marginMobile,
    paddingRight: Spacing.marginMobile,
    gap: Spacing.md,
  },
  furnitureCard: {
    width: 280,
  },
});
