import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/listing/listing-card';
import { ListingSkeleton } from '@/components/listing/listing-skeleton';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnounces } from '@/hooks/queries/use-announces';
import { useAuthStore } from '@/stores/auth.store';
import { LoginGate } from '@/components/ui/login-gate';

export default function FavoritesScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) {
    return (
      <SafeAreaView style={[{ flex: 1 }, { backgroundColor: C.background }]}>
        <View style={[styles.header, { borderBottomColor: C.outlineVariant }]}>
          <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>Mes Favoris</Text>
        </View>
        <LoginGate
          title="Accédez à vos favoris"
          subtitle={"Connectez-vous pour retrouver toutes les annonces que vous avez sauvegardées."}
        />
      </SafeAreaView>
    );
  }

  const { data, isLoading, isFetching, refetch } = useAnnounces({ liked: true });
  const favorites = data?.data ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant }]}>
        <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>
          Mes Favoris
        </Text>
      </View>

      {isLoading ? (
        <View style={[styles.list, { gap: Spacing.md }]}>
          {[1, 2, 3].map((k) => <ListingSkeleton key={k} />)}
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="favorite-border" size={56} color={C.outlineVariant} />
          <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20, marginTop: Spacing.lg, textAlign: 'center' }]}>
            Aucun favori
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, maxWidth: 280 }]}>
            Enregistrez vos annonces préférées en appuyant sur le cœur pour les retrouver ici.
          </Text>
          <Button
            label="Explorer les annonces"
            onPress={() => router.push('/(tabs)/explore')}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <ListingCard
              announce={item}
              onPress={() => router.push(`/announces/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginMobile,
  },
  list: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
