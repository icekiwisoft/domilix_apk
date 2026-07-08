import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ActivityIndicator, Button, Card, Dialog, IconButton, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth.store';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useAnnounces, useDeleteAnnounce, useInfiniteAnnounces } from '@/hooks/queries/use-announces';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';
import { ManageCardSkeleton } from '@/components/listing/listing-skeleton';
import type { Announce } from '@/types/announce';

const THUMB_SIZE = 104;
const STAGGER_MS = 40;
const STAGGER_CAP = 8;

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}k`;
  return price.toLocaleString('fr-FR');
}

function formatDate(value?: string): string {
  if (!value) return 'Date indisponible';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value)
  );
}

function getTitle(announce: Announce): string {
  return announce.description?.split('.')[0]?.trim() || announce.category?.name || 'Annonce sans titre';
}

function getCurrency(announce: Announce): string {
  return announce.devise === 'XAF' ? 'FCFA' : announce.devise;
}

function getPeriodSuffix(announce: Announce): string {
  if (announce.period === 'month') return '/mois';
  if (announce.period === 'year') return '/an';
  if (announce.period === 'day') return '/jour';
  return '';
}

interface ManageCardProps {
  announce: Announce;
  index: number;
  deleting?: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ManageCard({ announce, index, deleting, onView, onEdit, onDelete }: ManageCardProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const thumb =
    announce.medias?.[0]?.thumbnail ??
    announce.medias?.[0]?.file ??
    `https://picsum.photos/seed/${announce.id}/400/400`;

  const isLocation = announce.ad_type === 'location';
  const isFurniture = announce.type === 'furniture';
  const locationText = [announce.neighborhood, announce.city].filter(Boolean).join(', ') || announce.address;
  const likesCount = announce.likes_count ?? 0;
  const title = getTitle(announce);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, STAGGER_CAP) * STAGGER_MS).duration(260)}>
      <Card
        mode="elevated"
        style={[styles.card, { backgroundColor: C.surfaceContainerLowest }]}
        onPress={onView}
        accessibilityLabel={`Voir l'annonce ${title}`}
      >
        <View style={styles.cardBody}>
          <View style={[styles.thumbBox, { backgroundColor: C.surfaceContainerLow }]}>
            <Image source={{ uri: thumb }} style={styles.thumbImg} resizeMode="cover" />
            <View style={[styles.photoBadge, { backgroundColor: 'rgba(34, 26, 18, 0.72)' }]}>
              <MaterialIcons name="photo-camera" size={11} color="#fff" />
              <Text style={styles.photoBadgeText}>{announce.medias?.length ?? 0}</Text>
            </View>
          </View>

          <View style={styles.infoCol}>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: isLocation ? C.tertiaryContainer : C.primaryFixed }]}>
                <Text style={[styles.statusBadgeText, { color: isLocation ? C.onTertiaryContainer : C.primaryContainer }]}>
                  {isLocation ? 'Location' : 'Vente'}
                </Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: C.surfaceContainerHigh }]}>
                <MaterialIcons
                  name={isFurniture ? 'chair' : 'apartment'}
                  size={12}
                  color={C.onSurfaceVariant}
                />
                <Text style={[styles.typeBadgeText, { color: C.onSurfaceVariant }]}>
                  {isFurniture ? 'Mobilier' : 'Immobilier'}
                </Text>
              </View>
            </View>

            <Text style={[styles.cardTitle, { color: C.onSurface }]} numberOfLines={2}>
              {title}
            </Text>

            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={13} color={C.secondary} />
              <Text style={[styles.locationText, { color: C.onSurfaceVariant }]} numberOfLines={1}>
                {locationText}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: C.primary }]}>
                {formatPrice(announce.price)}
              </Text>
              <Text style={[styles.currency, { color: C.onSurfaceVariant }]}>
                {getCurrency(announce)}{getPeriodSuffix(announce)}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.metaPill, { backgroundColor: C.surfaceContainerLow }]}>
                <MaterialIcons name="favorite-border" size={12} color={C.onSurfaceVariant} />
                <Text style={[styles.metaText, { color: C.onSurfaceVariant }]}>
                  {likesCount}
                </Text>
              </View>
              <View style={[styles.metaPill, { backgroundColor: C.surfaceContainerLow }]}>
                <MaterialIcons name="event" size={12} color={C.onSurfaceVariant} />
                <Text style={[styles.metaText, { color: C.onSurfaceVariant }]}>
                  {formatDate(announce.creation_date)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Card.Actions style={[styles.actionBar, { borderTopColor: C.outlineVariant + '66' }]}>
          <Button mode="text" icon="eye-outline" compact onPress={onView} textColor={C.onSurfaceVariant} style={styles.actionBtn} labelStyle={styles.actionLabel}>
            Voir
          </Button>
          <Button mode="text" icon="pencil-outline" compact onPress={onEdit} textColor={C.primary} style={styles.actionBtn} labelStyle={styles.actionLabel}>
            Modifier
          </Button>
          <Button
            mode="text"
            icon="delete-outline"
            compact
            disabled={deleting}
            onPress={onDelete}
            textColor={C.error}
            style={styles.actionBtn}
            labelStyle={styles.actionLabel}
          >
            {deleting ? 'Suppression' : 'Supprimer'}
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );
}

export default function MyListingsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();

  const hydrated = useAuthStore(s => s.hydrated);
  const storeUser = useAuthStore(s => s.user);

  const { data: meData } = useMe();
  // Prefer React Query data (most up-to-date), fall back to Zustand store user
  // set by AuthProvider hydration so announcerId is available immediately
  const user = meData ?? storeUser;
  const announcerId = user?.announcer ?? '';
  const hasAnnouncerId = !!announcerId;

  const {
    data: pages,
    isLoading: isListingsLoading,
    isFetching,
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
  const showEmptyState = !isPageLoading && listings.length === 0;

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant + '77' }]}>
        <IconButton
          icon="arrow-left"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          iconColor={C.onSurface}
          style={styles.backBtn}
        />

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: C.onSurface }]}>Mes annonces</Text>
          {!isPageLoading && total > 0 && (
            <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
              {total} publication{total > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <IconButton
          icon="plus"
          accessibilityLabel="Publier une annonce"
          onPress={() => router.push('/announces/create/step-1')}
          iconColor={C.onPrimary}
          containerColor={C.primary}
          style={styles.addBtn}
        />
      </View>

      <FlatList
        data={isPageLoading ? [] : listings}
        keyExtractor={(a) => a.id}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPageLoading}
            onRefresh={refetch}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        contentContainerStyle={styles.flatContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.paginationLoader} /> : null}
        renderItem={({ item, index }) => (
          <ManageCard
            announce={item}
            index={index}
            deleting={deleteAnnounce.isPending}
            onView={() => router.push(`/announces/${item.id}`)}
            onEdit={() => router.push(`/announces/edit/${item.id}`)}
            onDelete={() => setDeleteTarget(item)}
          />
        )}
        ListHeaderComponent={
          isPageLoading ? (
            <View style={{ gap: Spacing.md }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <ManageCardSkeleton key={i} />
              ))}
            </View>
          ) : listings.length > 0 ? (
            <View style={[styles.summary, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant + '66' }]}>
              <SummaryItem value={total} label="Total" color={C.primary} mutedColor={C.onSurfaceVariant} />
              <View style={[styles.summarySep, { backgroundColor: C.outlineVariant }]} />
              <SummaryItem value={locationCount} label="Locations" color={C.tertiary} mutedColor={C.onSurfaceVariant} />
              <View style={[styles.summarySep, { backgroundColor: C.outlineVariant }]} />
              <SummaryItem value={saleCount} label="Ventes" color={C.secondary} mutedColor={C.onSurfaceVariant} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          showEmptyState ? (
            <EmptyState
              title="Aucune annonce"
              description="Vous n'avez pas encore publié d'annonce. Commencez dès maintenant."
              ctaLabel="Publier une annonce"
              onCta={() => router.push('/announces/create/step-1')}
              icon={<MaterialIcons name="add-home" size={36} color={C.primary} />}
            />
          ) : null
        }
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Supprimer cette annonce ?</Dialog.Title>
          <Dialog.Content>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              Cette action est irréversible.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={() => setDeleteTarget(null)}>Annuler</Button>
            <Button mode="text" textColor={C.error} onPress={handleDeleteConfirmed}>Supprimer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

function SummaryItem({
  value,
  label,
  color,
  mutedColor,
}: {
  value: number;
  label: string;
  color: string;
  mutedColor: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: mutedColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  backBtn: {
    margin: 0,
    flexShrink: 0,
  },
  headerCenter: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    lineHeight: 24,
  },
  addBtn: {
    margin: 0,
    flexShrink: 0,
  },
  flatContent: {
    flexGrow: 1,
    padding: Spacing.marginMobile,
    paddingBottom: Spacing.xl,
  },
  paginationLoader: { marginTop: Spacing.md },
  summary: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    lineHeight: 15,
  },
  summarySep: {
    width: 1,
    height: 26,
    opacity: 0.8,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm + 2,
  },
  thumbBox: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    left: 7,
    bottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  photoBadgeText: {
    color: '#fff',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    lineHeight: 12,
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  typeBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typeBadgeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    lineHeight: 13,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    lineHeight: 19,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  price: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    lineHeight: 23,
  },
  currency: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    lineHeight: 13,
    fontVariant: ['tabular-nums'],
  },
  actionBar: {
    borderTopWidth: 1,
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
  actionLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    lineHeight: 15,
  },
});
