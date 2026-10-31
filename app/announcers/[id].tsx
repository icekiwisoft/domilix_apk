import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { AnnouncerDetailSkeleton } from '@/components/announcer/announcer-detail-skeleton';
import { AnnounceCard } from '@/components/listing/announce-card';
import {
  AppText,
  Avatar,
  Badge,
  Card,
  Divider,
  EmptyState,
  ErrorState,
  ListingCardSkeleton,
  ListRow,
  Screen,
  ScreenHeader,
  SearchBar,
  Section,
  SegmentedControl,
  Skeleton,
} from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { useInfiniteAnnounces, useToggleLike } from '@/hooks/queries/use-announces';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { useThemeColors } from '@/hooks/use-theme-color';

const PAGINATION_THRESHOLD = 400;
/** fontScale from which the cards and photos go one per row. */
const ONE_COLUMN_SCALE = 1.3;

type TabName = 'annonces' | 'medias' | 'about';

const TABS = [
  { value: 'annonces' as const, label: 'Annonces' },
  { value: 'medias' as const, label: 'Médias' },
  { value: 'about' as const, label: 'À propos' },
];

/** Stat of the identity card; `stacked`: one row per stat, value then label (large font sizes). */
function Stat({ value, label, stacked }: { value: number; label: string; stacked: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={
        stacked
          ? { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: Spacing.sm }
          : { flex: 1, alignItems: 'center' }
      }
    >
      <AppText variant="headline">{value}</AppText>
      <AppText variant="caption" color="onSurfaceVariant" style={{ textAlign: 'center' }}>
        {label}
      </AppText>
    </View>
  );
}

export default function AnnouncerProfileScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabName>('annonces');
  const [search, setSearch] = useState('');

  const { data: announcer, isLoading, isError, error, isFetching, refetch } = useAnnouncer(id ?? '');
  // A 404 is a missing profile; any other failure (offline, 5xx) can be retried.
  const notFound = (error as { response?: { status?: number } } | null)?.response?.status === 404;
  const {
    data: listingsPages,
    isLoading: listingsLoading,
    isError: listingsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchListings,
  } = useInfiniteAnnounces({ AnnouncerId: id ?? '' }, { enabled: !!id });
  const toggleLike = useToggleLike();
  // Opened by a deep link (or after the activity is recreated, e.g. a font
  // size change) there may be no screen to go back to: the arrow then opens
  // the home screen instead of disappearing (QA-02).
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Before any early return: hooks must run in the same order on every render.
  const listings = useMemo(() => listingsPages?.pages.flatMap((p) => p.data) ?? [], [listingsPages]);
  const allMedias = useMemo(() => listings.flatMap((a) => a.medias), [listings]);

  if (isLoading) {
    return <AnnouncerDetailSkeleton onBack={goBack} />;
  }

  if (!announcer) {
    return (
      <Screen header={<ScreenHeader title="Annonceur" onBack={goBack} />}>
        {isError && !notFound ? (
          // Offline or a server error: the profile may well exist.
          <ErrorState title="Impossible de charger ce profil" onRetry={() => refetch()} />
        ) : (
          <EmptyState
            icon="person-off"
            title="Profil introuvable"
            description="Ce profil n'existe pas ou n'est plus disponible."
            actionLabel="Retour"
            onAction={goBack}
          />
        )}
      </Screen>
    );
  }

  const totalListings =
    (listingsPages?.pages[0]?.meta.total ?? (announcer.houses ?? 0) + (announcer.furnitures ?? 0)) ||
    listings.length;
  const query = search.trim().toLowerCase();
  const filteredListings = query
    ? listings.filter((a) => a.description?.toLowerCase().includes(query) || a.city?.toLowerCase().includes(query))
    : listings;

  const displayName = announcer.name;
  const memberYear = announcer.creation_date ? new Date(announcer.creation_date).getFullYear() : null;

  // Two columns on the page gutter, one at large font sizes.
  const columns = fontScale >= ONE_COLUMN_SCALE ? 1 : 2;
  const stackedStats = fontScale >= ONE_COLUMN_SCALE;
  const tileWidth = (width - Spacing.marginMobile * 2 - Spacing.ms * (columns - 1)) / columns;

  function handleRefresh() {
    refetch();
    refetchListings();
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (activeTab === 'about' || !hasNextPage || isFetchingNextPage) return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    if (distanceFromBottom < PAGINATION_THRESHOLD) {
      fetchNextPage();
    }
  }

  const nextPageSkeleton = isFetchingNextPage ? (
    <View
      accessible
      accessibilityLabel="Chargement de la suite…"
      accessibilityState={{ busy: true }}
      style={{ flexDirection: 'row', gap: Spacing.ms }}
    >
      {Array.from({ length: columns }, (_, k) => (
        <ListingCardSkeleton key={k} style={{ width: tileWidth }} />
      ))}
    </View>
  ) : null;

  let tabContent;
  if (activeTab === 'annonces') {
    let list;
    if (listingsLoading) {
      list = (
        <View
          accessible
          accessibilityLabel="Chargement des annonces…"
          accessibilityState={{ busy: true }}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}
        >
          {[1, 2, 3, 4].map((k) => (
            <ListingCardSkeleton key={k} style={{ width: tileWidth }} />
          ))}
        </View>
      );
    } else if (listingsError && listings.length === 0) {
      list = <ErrorState title="Impossible de charger les annonces" onRetry={() => refetchListings()} />;
    } else if (filteredListings.length === 0) {
      list = (
        <EmptyState
          icon={search ? 'search-off' : 'home-work'}
          title={search ? 'Aucun résultat' : 'Aucune annonce'}
          description={search ? 'Essayez avec un autre mot-clé.' : "Cet annonceur n'a pas encore publié d'annonce."}
        />
      );
    } else {
      list = (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
            {filteredListings.map((a) => (
              <AnnounceCard
                key={a.id}
                announce={a}
                onPress={() => router.push(`/announces/${a.id}`)}
                onToggleFavorite={(likeId) => toggleLike.mutate(likeId)}
                style={{ width: tileWidth }}
              />
            ))}
          </View>
          {nextPageSkeleton}
        </>
      );
    }
    tabContent = (
      <>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une annonce…"
          label="Rechercher dans les annonces de cet annonceur"
        />
        {list}
      </>
    );
  } else if (activeTab === 'medias') {
    let grid;
    if (listingsLoading) {
      grid = (
        <View
          accessible
          accessibilityLabel="Chargement des médias…"
          accessibilityState={{ busy: true }}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}
        >
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} width={tileWidth} height={tileWidth} radius={Radii.control} />
          ))}
        </View>
      );
    } else if (listingsError && listings.length === 0) {
      grid = <ErrorState title="Impossible de charger les médias" onRetry={() => refetchListings()} />;
    } else if (allMedias.length === 0) {
      grid = (
        <EmptyState
          icon="photo-library"
          title="Aucun média"
          description="Les photos des annonces apparaîtront ici."
        />
      );
    } else {
      grid = (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
            {allMedias.map((m, idx) => (
              <Image
                key={m.id ?? String(idx)}
                source={{ uri: m.thumbnail ?? m.file }}
                style={{
                  width: tileWidth,
                  height: tileWidth,
                  borderRadius: Radii.control,
                  backgroundColor: C.surfaceContainerHigh,
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
                accessible={false}
              />
            ))}
          </View>
          {isFetchingNextPage ? (
            <View accessible accessibilityLabel="Chargement de la suite…" accessibilityState={{ busy: true }}>
              <Skeleton width={tileWidth} height={tileWidth} radius={Radii.control} />
            </View>
          ) : null}
        </>
      );
    }
    tabContent = (
      <>
        <View style={{ gap: Spacing.xxs }}>
          <AppText variant="headline" accessibilityRole="header">
            Médias publiés
          </AppText>
          <AppText variant="caption" color="onSurfaceVariant">
            {allMedias.length} média{allMedias.length !== 1 ? 's' : ''}
          </AppText>
        </View>
        {grid}
      </>
    );
  } else {
    tabContent = (
      <>
        <Card>
          <AppText variant="headline" accessibilityRole="header">
            Biographie
          </AppText>
          <AppText color="onSurfaceVariant">
            {announcer.bio || 'Aucune biographie disponible pour cet annonceur.'}
          </AppText>
        </Card>
        <Section title="Informations du profil">
          <ListRow
            icon={announcer.verified ? 'verified' : 'radio-button-unchecked'}
            title="Statut"
            subtitle={announcer.verified ? 'Compte vérifié' : 'Non vérifié'}
          />
          {memberYear ? (
            <ListRow
              icon="calendar-today"
              title="Membre depuis"
              subtitle={new Date(announcer.creation_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          ) : null}
        </Section>
      </>
    );
  }

  return (
    <Screen
      header={<ScreenHeader title="Annonceur" onBack={goBack} />}
      onRefresh={handleRefresh}
      refreshing={isFetching && !isLoading}
      onScroll={handleScroll}
      showsVerticalScrollIndicator={false}
      contentStyle={{ gap: Spacing.lg }}
    >
      {/* Profile */}
      <Card style={{ alignItems: 'center', padding: Spacing.marginMobile }}>
        <Avatar name={displayName} uri={announcer.avatar} size="lg" />
        <AppText variant="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
          {displayName}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm }}>
          {announcer.verified ? <Badge label="Vérifié" variant="success" icon="verified" status /> : null}
          {memberYear ? (
            <AppText variant="caption" color="onSurfaceVariant">
              Membre depuis {memberYear}
            </AppText>
          ) : null}
        </View>
        {announcer.bio ? (
          <AppText color="onSurfaceVariant" numberOfLines={2} style={{ textAlign: 'center' }}>
            {announcer.bio}
          </AppText>
        ) : null}
        <Divider style={{ marginTop: Spacing.sm }} />
        {/* Three columns cut "Annonces" mid-word at 200 %: one row per stat from 130 % (QA-03). */}
        <View
          style={{
            flexDirection: stackedStats ? 'column' : 'row',
            alignSelf: 'stretch',
            gap: stackedStats ? Spacing.xs : 0,
            paddingTop: Spacing.xs,
          }}
        >
          <Stat value={announcer.furnitures ?? 0} label="Meubles" stacked={stackedStats} />
          <Stat value={announcer.houses ?? 0} label="Maisons" stacked={stackedStats} />
          <Stat value={totalListings} label="Annonces" stacked={stackedStats} />
        </View>
      </Card>

      <SegmentedControl label="Contenu du profil" options={TABS} value={activeTab} onChange={setActiveTab} />

      {tabContent}
    </Screen>
  );
}
