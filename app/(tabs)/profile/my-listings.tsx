import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useDeleteAnnounce, useMyAnnounces } from '@/hooks/queries/use-announces';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';
import { ListingCardHSkeleton } from '@/components/listing/listing-skeleton';
import type { Announce } from '@/types/announce';

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}k`;
  return price.toLocaleString('fr-FR');
}

const THUMB_SIZE = 72;

// ─── ManageCard ───────────────────────────────────────────────────────────────

interface ManageCardProps {
  announce: Announce;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ManageCard({ announce, onView, onEdit, onDelete }: ManageCardProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const thumb =
    announce.medias[0]?.thumbnail ??
    announce.medias[0]?.file ??
    `https://picsum.photos/seed/${announce.id}/300/300`;

  const isLocation = announce.ad_type === 'location';
  const currency = announce.devise === 'XAF' ? 'FCFA' : announce.devise;

  return (
    <View style={[styles.card, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant + '55' }]}>
      {/* Content row — tappable for detail */}
      <Pressable
        onPress={onView}
        style={({ pressed }) => [styles.contentRow, pressed && { opacity: 0.88 }]}
      >
        {/* Thumbnail */}
        <View style={[styles.thumbBox, { backgroundColor: C.surfaceContainerLow }]}>
          <Image source={{ uri: thumb }} style={styles.thumbImg} resizeMode="cover" />
          <View style={[styles.chip, { backgroundColor: isLocation ? C.tertiary : C.primaryContainer }]}>
            <Text style={[styles.chipText, { color: C.onPrimary }]}>
              {isLocation ? 'Loc.' : 'Vente'}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCol}>
          <Text style={[styles.cardTitle, { color: C.onSurface }]} numberOfLines={1}>
            {announce.description.split('.')[0]}
          </Text>

          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={11} color={C.primary} />
            <Text style={[styles.locationText, { color: C.onSurfaceVariant }]} numberOfLines={1}>
              {announce.city}
            </Text>
          </View>

          <Text style={[styles.price, { color: C.primary }]}>
            {formatPrice(announce.price)}{' '}
            <Text style={[styles.currency, { color: C.onSurfaceVariant }]}>{currency}</Text>
          </Text>
        </View>
      </Pressable>

      {/* Action bar */}
      <View style={[styles.actionBar, { borderTopColor: C.outlineVariant + '55' }]}>
        <Pressable
          onPress={onView}
          hitSlop={6}
          style={({ pressed }) => [styles.actionBtn, pressed && { backgroundColor: C.surfaceContainerLow }]}
        >
          <MaterialIcons name="visibility" size={15} color={C.onSurfaceVariant} />
          <Text style={[styles.actionLabel, { color: C.onSurfaceVariant }]}>Voir</Text>
        </Pressable>

        <View style={[styles.actionSep, { backgroundColor: C.outlineVariant + '55' }]} />

        <Pressable
          onPress={onEdit}
          hitSlop={6}
          style={({ pressed }) => [styles.actionBtn, pressed && { backgroundColor: C.primaryFixed + '44' }]}
        >
          <MaterialIcons name="edit" size={15} color={C.primary} />
          <Text style={[styles.actionLabel, { color: C.primary }]}>Modifier</Text>
        </Pressable>

        <View style={[styles.actionSep, { backgroundColor: C.outlineVariant + '55' }]} />

        <Pressable
          onPress={onDelete}
          hitSlop={6}
          style={({ pressed }) => [styles.actionBtn, pressed && { backgroundColor: C.errorContainer + '44' }]}
        >
          <MaterialIcons name="delete-outline" size={15} color={C.error} />
          <Text style={[styles.actionLabel, { color: C.error }]}>Supprimer</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyListingsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();

  const { data: user } = useMe();
  const announcerId = user?.announcer?.id ?? '';

  const { data: result, isLoading, isFetching, refetch } = useMyAnnounces(announcerId);
  const deleteAnnounce = useDeleteAnnounce();
  const listings = result?.data ?? [];
  const total = result?.total ?? listings.length;

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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant + '77' }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: C.onSurface }]}>Mes annonces</Text>
          {!isLoading && total > 0 && (
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
        data={isLoading ? [] : listings}
        keyExtractor={(a) => a.id}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        contentContainerStyle={
          !isLoading && listings.length === 0 ? styles.flatEmpty : styles.flatContent
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <ManageCard
            announce={item}
            onView={() => router.push(`/announces/${item.id}`)}
            onEdit={() => router.push(`/announces/edit/${item.id}`)}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListHeaderComponent={
          isLoading ? (
            <View style={{ gap: Spacing.md }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <ListingCardHSkeleton key={i} />
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              title="Aucune annonce"
              description="Vous n'avez pas encore publié d'annonce. Commencez dès maintenant."
              ctaLabel="Publier une annonce"
              onCta={() => router.push('/announces/create/step-1')}
              icon={<MaterialIcons name="add-home" size={36} color={C.primary} />}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // ── Header ──
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

  // ── List ──
  flatContent: {
    padding: Spacing.marginMobile,
  },
  flatEmpty: {
    flex: 1,
    padding: Spacing.marginMobile,
  },

  // ── ManageCard ──
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  thumbBox: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  chip: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.4,
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    gap: 3,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  price: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    lineHeight: 19,
  },
  currency: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 10,
  },

  // ── Action bar ──
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 7,
  },
  actionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    lineHeight: 15,
  },
  actionSep: {
    width: 1,
    height: 14,
  },
});
