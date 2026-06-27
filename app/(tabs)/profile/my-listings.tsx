import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useDeleteAnnounce } from '@/hooks/queries/use-announces';
import { AnnouncesService } from '@/services/announces.service';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';
import { ListingCardH } from '@/components/listing/listing-card-h';
import { ListingCardHSkeleton } from '@/components/listing/listing-skeleton';
import type { Announce } from '@/types/announce';

export default function MyListingsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();

  const { data: user } = useMe();
  const announcerId = user?.announcer?.id ?? '';

  const { data: result, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['my-announces', announcerId],
    queryFn: () => AnnouncesService.list({ AnnouncerId: announcerId }),
    enabled: !!announcerId,
  });

  const deleteAnnounce = useDeleteAnnounce();
  const listings = result?.data ?? [];

  function handleOptions(announce: Announce) {
    Alert.alert(
      announce.description.split('.')[0].trim(),
      undefined,
      [
        {
          text: 'Voir le détail',
          onPress: () => router.push(`/announces/${announce.id}`),
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => confirmDelete(announce),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }

  function confirmDelete(announce: Announce) {
    Alert.alert(
      'Supprimer cette annonce ?',
      'Cette action est irréversible.',
      [
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
      ]
    );
  }

  const total = result?.total ?? listings.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.outlineVariant }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>
          Mes annonces
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/profile/publish')}
          hitSlop={8}
          style={[styles.addBtn, { backgroundColor: C.primary, ...Shadows.button }]}
        >
          <MaterialIcons name="add" size={20} color={C.onPrimary} />
        </Pressable>
      </View>

      {/* Count */}
      {!isLoading && total > 0 && (
        <View style={[styles.countRow, { backgroundColor: C.surfaceContainerLow, borderBottomColor: C.outlineVariant }]}>
          <MaterialIcons name="home-work" size={14} color={C.onSurfaceVariant} />
          <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
            {total} publication{total > 1 ? 's' : ''}
          </Text>
        </View>
      )}

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
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <View style={{ flex: 1 }}>
              <ListingCardH
                announce={item}
                onPress={() => router.push(`/announces/${item.id}`)}
              />
            </View>
            <Pressable
              onPress={() => handleOptions(item)}
              hitSlop={8}
              style={[styles.menuBtn, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}
            >
              <MaterialIcons name="more-vert" size={20} color={C.onSurfaceVariant} />
            </Pressable>
          </View>
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
              onCta={() => router.push('/(tabs)/profile/publish')}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  flatContent: {
    padding: Spacing.marginMobile,
  },
  flatEmpty: {
    flex: 1,
    padding: Spacing.marginMobile,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
