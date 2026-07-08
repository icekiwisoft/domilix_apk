import { useCallback } from 'react';
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth.store';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useDeleteAnnounce, useMyAnnounces } from '@/hooks/queries/use-announces';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';
import { ListingCardHSkeleton } from '@/components/listing/listing-skeleton';
import type { Announce } from '@/types/announce';

const THUMB_SIZE = 104;

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
  deleting?: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ManageCard({ announce, deleting, onView, onEdit, onDelete }: ManageCardProps) {
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

  return (
    <View style={[styles.card, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant + '66' }]}>
      <Pressable
        onPress={onView}
        style={({ pressed }) => [styles.cardBody, pressed && { opacity: 0.9 }]}
      >
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
            {getTitle(announce)}
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
      </Pressable>

      <View style={[styles.actionBar, { borderTopColor: C.outlineVariant + '66' }]}>
        <ActionButton
          icon="visibility"
          label="Voir"
          color={C.onSurfaceVariant}
          background={C.surfaceContainerLow}
          onPress={onView}
        />
        <ActionButton
          icon="edit"
          label="Modifier"
          color={C.primary}
          background={C.primaryFixed + '55'}
          onPress={onEdit}
        />
        <ActionButton
          icon="delete-outline"
          label={deleting ? 'Suppression' : 'Supprimer'}
          color={C.error}
          background={C.errorContainer + '55'}
          disabled={deleting}
          onPress={onDelete}
        />
      </View>
    </View>
  );
}

interface ActionButtonProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  color: string;
  background: string;
  disabled?: boolean;
  onPress: () => void;
}

function ActionButton({ icon, label, color, background, disabled, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.actionBtn,
        pressed && !disabled && { backgroundColor: background },
        disabled && { opacity: 0.55 },
      ]}
    >
      <MaterialIcons name={icon} size={16} color={color} />
      <Text style={[styles.actionLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function MyListingsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();

  const hydrated = useAuthStore(s => s.hydrated);
  const storeUser = useAuthStore(s => s.user);

  const { data: meData, isLoading: isUserLoading, isFetching: isUserFetching } = useMe();
  // Prefer React Query data (most up-to-date), fall back to Zustand store user
  // set by AuthProvider hydration so announcerId is available immediately
  const user = meData ?? storeUser;
  const announcerId = user?.announcer?.id ?? '';

  const { data: result, isLoading: isListingsLoading, isFetching, isFetched, refetch } = useMyAnnounces(announcerId);
  const deleteAnnounce = useDeleteAnnounce();
  const listings = result?.data ?? [];
  const total = result?.total ?? listings.length;
  const locationCount = listings.filter((item) => item.ad_type === 'location').length;
  const saleCount = listings.filter((item) => item.ad_type === 'sale').length;
  const isWaitingForAnnouncer = (isUserLoading || isUserFetching) && !announcerId;
  const isInitialListingsLoad = isListingsLoading || (isFetching && listings.length === 0);
  // !hydrated → tokens not yet read from storage (white page window)
  // !!announcerId && !isFetched → announcerId just arrived, fetch not started yet
  const isPageLoading = !hydrated || isWaitingForAnnouncer || isInitialListingsLoad || (!!announcerId && !isFetched);
  const showEmptyState = !isPageLoading && isFetched && listings.length === 0;

  useFocusEffect(
    useCallback(() => {
      if (announcerId) {
        refetch();
      }
    }, [announcerId, refetch])
  );

  function confirmDelete(announce: Announce) {
    Alert.alert('Supprimer cette annonce ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          deleteAnnounce.mutate(announce.id, {
            onSuccess: () => toast.show('Annonce supprimée.', 'success'),
            onError: () => toast.show('Échec de la suppression.', 'error'),
          }),
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant + '77' }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: C.onSurface }]}>Mes annonces</Text>
          {!isPageLoading && total > 0 && (
            <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
              {total} publication{total > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => router.push('/announces/create/step-1')}
          hitSlop={8}
          style={[styles.addBtn, { backgroundColor: C.primary }, Shadows.button]}
        >
          <MaterialIcons name="add" size={20} color={C.onPrimary} />
        </Pressable>
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
        contentContainerStyle={
          showEmptyState ? styles.flatEmpty : styles.flatContent
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        renderItem={({ item }) => (
          <ManageCard
            announce={item}
            deleting={deleteAnnounce.isPending}
            onView={() => router.push(`/announces/${item.id}`)}
            onEdit={() => router.push(`/announces/edit/${item.id}`)}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListHeaderComponent={
          isPageLoading ? (
            <View style={{ gap: Spacing.md }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <ListingCardHSkeleton key={i} />
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
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flatContent: {
    padding: Spacing.marginMobile,
    paddingBottom: Spacing.xl,
  },
  flatEmpty: {
    flex: 1,
    padding: Spacing.marginMobile,
  },
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
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  actionLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    lineHeight: 15,
  },
});
