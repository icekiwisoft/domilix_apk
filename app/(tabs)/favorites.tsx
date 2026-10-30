import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';

import { AnnounceCard } from '@/components/listing/announce-card';
import {
  EmptyState,
  ErrorState,
  ListingCardSkeleton,
  LoginGate,
  OfflineState,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useInfiniteAnnounces, useToggleLike } from '@/hooks/queries/use-announces';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isNetworkError } from '@/lib/network-error';
import { useAuthStore } from '@/stores/auth.store';

const TITLE = 'Mes favoris';

export default function FavoritesScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteAnnounces({ liked: true }, { enabled: !!accessToken });
  const favorites = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const toggleLike = useToggleLike();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  if (!accessToken) {
    return (
      <Screen bottomInset={false} header={<ScreenHeader title={TITLE} onBack={false} />}>
        <LoginGate
          redirect="/(tabs)/favorites"
          title="Connectez-vous pour voir vos favoris"
          subtitle="Sauvegardez vos annonces préférées et retrouvez-les en vous connectant à votre compte."
        />
      </Screen>
    );
  }

  let empty = null;
  if (isLoading) {
    empty = (
      <View
        accessible
        accessibilityLabel="Chargement des favoris…"
        accessibilityState={{ busy: true }}
        style={{ gap: Spacing.ms }}
      >
        {[1, 2, 3].map((k) => (
          <ListingCardSkeleton key={k} variant="compact" />
        ))}
      </View>
    );
  } else if (isError && isNetworkError(error)) {
    empty = <OfflineState onRetry={() => refetch()} />;
  } else if (isError) {
    empty = <ErrorState title="Impossible de charger vos favoris" onRetry={() => refetch()} />;
  } else {
    empty = (
      <EmptyState
        icon="favorite-border"
        title="Aucun favori pour le moment"
        description="Touchez le cœur d'une annonce pour la retrouver ici."
        actionLabel="Parcourir les annonces"
        onAction={() => router.push('/(tabs)/explore')}
      />
    );
  }

  return (
    <Screen
      scroll={false}
      bottomInset={false}
      header={<ScreenHeader title={TITLE} onBack={false} />}
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <FlatList
        data={isLoading || isError ? [] : favorites}
        keyExtractor={(a) => String(a.id)}
        renderItem={({ item }) => (
          <AnnounceCard
            variant="compact"
            announce={item}
            onPress={() => router.push(`/announces/${item.id}`)}
            onToggleFavorite={(id) => toggleLike.mutate(id)}
          />
        )}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.ms }} />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={C.primaryContainer}
              accessibilityLabel="Chargement de la suite…"
              style={{ marginTop: Spacing.md }}
            />
          ) : null
        }
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.marginMobile,
          paddingTop: Spacing.sm,
          paddingBottom: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.primaryContainer]}
            progressBackgroundColor={C.surfaceContainerLowest}
            tintColor={C.primaryContainer}
          />
        }
      />
    </Screen>
  );
}
