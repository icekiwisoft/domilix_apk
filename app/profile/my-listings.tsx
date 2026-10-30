import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';

import { AnnounceCard, announceTitle } from '@/components/listing/announce-card';
import {
  AppText,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  IconButton,
  ListingCardSkeleton,
  Screen,
  ScreenHeader,
  useToast,
} from '@/components/ui';
import { Borders, Spacing, type ColorToken } from '@/constants/theme';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useAnnounces, useDeleteAnnounce, useInfiniteAnnounces } from '@/hooks/queries/use-announces';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/stores/auth.store';
import type { Announce } from '@/types/announce';

function formatDate(value?: string): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

interface OwnerActionsProps {
  announce: Announce;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** Under each of the announcer's cards: favourites, date, then Modifier and Supprimer (the card itself opens the listing). */
function OwnerActions({ announce, deleting, onEdit, onDelete }: OwnerActionsProps) {
  const C = useThemeColors();
  const title = announceTitle(announce);
  const likes = announce.likes_count ?? 0;
  const date = formatDate(announce.creation_date);
  const meta = [
    `${announce.type === 'furniture' ? 'Mobilier' : 'Immobilier'}`,
    `${likes} favori${likes > 1 ? 's' : ''}`,
    date ? `publiée le ${date}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <View
      style={{
        gap: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: Borders.thin,
        borderTopColor: C.outlineVariant,
      }}
    >
      <AppText variant="caption" color="onSurfaceVariant">
        {meta}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm }}>
        <Button
          label="Modifier"
          icon="edit"
          variant="secondary"
          accessibilityLabel={`Modifier ${title}`}
          onPress={onEdit}
          style={{ flexGrow: 1 }}
        />
        <IconButton
          icon="delete-outline"
          label={`Supprimer ${title}`}
          color="error"
          disabled={deleting}
          onPress={onDelete}
        />
      </View>
    </View>
  );
}

function SummaryItem({ value, label, color }: { value: number; label: string; color: ColorToken }) {
  return (
    <View accessible accessibilityLabel={`${value} ${label}`} style={{ flex: 1, alignItems: 'center', gap: Spacing.xxs }}>
      <AppText variant="headline" color={color}>
        {value}
      </AppText>
      <AppText variant="caption" color="onSurfaceVariant" style={{ textAlign: 'center' }}>
        {label}
      </AppText>
    </View>
  );
}

export default function MyListingsScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const toast = useToast();

  const hydrated = useAuthStore((s) => s.hydrated);
  const storeUser = useAuthStore((s) => s.user);

  const { data: meData } = useMe();
  // Prefer React Query data (most up-to-date), fall back to Zustand store user
  // set by AuthProvider hydration so announcerId is available immediately
  const user = meData ?? storeUser;
  const announcerId = user?.announcer ?? '';
  const hasAnnouncerId = !!announcerId;

  const {
    data: pages,
    isLoading: isListingsLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteAnnounces({ AnnouncerId: announcerId }, { enabled: hasAnnouncerId });
  const deleteAnnounce = useDeleteAnnounce();
  const listings = useMemo(() => pages?.pages.flatMap((p) => p.data) ?? [], [pages]);
  const total = pages?.pages[0]?.meta.total ?? listings.length;

  // Backend bug: the `ad_type` filter on GET /announces is not applied
  // server-side (confirmed: requesting ad_type=sale still returns "location"
  // items and the unfiltered total). Until the API honors it, fetch this
  // announcer's full listing set once — independent of how much the user has
  // scrolled in the main paginated list — and count ad_type ourselves.
  const { data: allForCounts } = useAnnounces(
    { AnnouncerId: announcerId, per_page: total },
    { enabled: hasAnnouncerId && total > 0 },
  );
  const locationCount = allForCounts?.data.filter((a) => a.ad_type === 'location').length ?? 0;
  const saleCount = allForCounts?.data.filter((a) => a.ad_type === 'sale').length ?? 0;

  // We have nothing useful to show until auth has hydrated, we know which
  // announcer we are, and that announcer's listings have loaded at least once.
  const isPageLoading = !hydrated || !hasAnnouncerId || isListingsLoading;

  // Belt-and-suspenders: force a fetch the moment the announcer id becomes
  // available, instead of only trusting the query's own `enabled` transition.
  useEffect(() => {
    if (hasAnnouncerId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnnouncerId]);

  // Refresh when coming back to this screen (e.g. after creating/editing/
  // deleting an announce from a child screen).
  useFocusEffect(
    useCallback(() => {
      if (hasAnnouncerId) {
        refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasAnnouncerId])
  );

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const [deleteTarget, setDeleteTarget] = useState<Announce | null>(null);

  function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    deleteAnnounce.mutate(id, {
      onSuccess: () => toast.show('Annonce supprimée.', 'success'),
      onError: () => toast.show('Échec de la suppression.', 'error'),
    });
  }

  const publish = () => router.push('/announces/create/step-1');

  let empty = null;
  if (isPageLoading) {
    empty = (
      <View accessible accessibilityLabel="Chargement de vos annonces…" accessibilityState={{ busy: true }} style={{ gap: Spacing.ms }}>
        {[1, 2, 3].map((k) => (
          <ListingCardSkeleton key={k} variant="compact" />
        ))}
      </View>
    );
  } else if (isError) {
    empty = <ErrorState title="Impossible de charger vos annonces" onRetry={() => refetch()} />;
  } else {
    empty = (
      <EmptyState
        icon="add-home"
        title="Aucune annonce"
        description="Vous n'avez pas encore publié d'annonce. Commencez dès maintenant."
        actionLabel="Publier une annonce"
        onAction={publish}
      />
    );
  }

  return (
    <Screen
      scroll={false}
      header={
        <ScreenHeader
          title="Mes annonces"
          actions={<Button label="Publier" icon="add" accessibilityLabel="Publier une annonce" onPress={publish} />}
        />
      }
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <FlatList
        data={isPageLoading || isError ? [] : listings}
        keyExtractor={(a) => String(a.id)}
        renderItem={({ item }) => (
          <AnnounceCard
            variant="compact"
            announce={item}
            onPress={() => router.push(`/announces/${item.id}`)}
            footer={
              <OwnerActions
                announce={item}
                deleting={deleteAnnounce.isPending}
                onEdit={() => router.push(`/announces/edit/${item.id}`)}
                onDelete={() => setDeleteTarget(item)}
              />
            }
          />
        )}
        ListHeaderComponent={
          !isPageLoading && !isError && listings.length > 0 ? (
            <Card style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.ms }}>
              <SummaryItem value={total} label={`publication${total > 1 ? 's' : ''}`} color="link" />
              <SummaryItem value={locationCount} label={`location${locationCount > 1 ? 's' : ''}`} color="tertiary" />
              <SummaryItem value={saleCount} label={`vente${saleCount > 1 ? 's' : ''}`} color="secondary" />
            </Card>
          ) : null
        }
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

      <Dialog
        visible={!!deleteTarget}
        title="Supprimer cette annonce ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </Screen>
  );
}
