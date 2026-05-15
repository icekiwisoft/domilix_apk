import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ListingPriceTag } from './listing-price-tag';
import type { Announce } from '@/types/announce';

const IMAGE_HEIGHT = 200;

// Derive badge from created_at (< 7 days = "nouveau")
function getBadge(announce: Announce): 'nouveau' | 'exclusivite' | null {
  const created = new Date(announce.created_at).getTime();
  const now = Date.now();
  if (now - created < 7 * 24 * 60 * 60 * 1000) return 'nouveau';
  return null;
}

interface ListingCardProps {
  announce: Announce;
  onPress?: () => void;
  onLike?: (id: string, liked: boolean) => void;
  badge?: 'nouveau' | 'exclusivite';
}

export function ListingCard({ announce, onPress, onLike, badge }: ListingCardProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const resolvedBadge = badge ?? getBadge(announce);
  const thumb = announce.medias[0]?.url ?? `https://picsum.photos/seed/${announce.id}/800/600`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: C.outlineVariant,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: thumb }} style={styles.image} resizeMode="cover" />

        {/* Badge */}
        {resolvedBadge === 'nouveau' && (
          <View style={[styles.badge, styles.badgeNew, { backgroundColor: C.surfaceContainerLowest + 'E6', borderColor: C.outlineVariant }]}>
            <View style={[styles.badgeDot, { backgroundColor: C.primaryFixedDim }]} />
            <Text style={[Typography.caption, styles.badgeText, { color: C.onSurface }]}>NOUVEAU</Text>
          </View>
        )}
        {resolvedBadge === 'exclusivite' && (
          <View style={[styles.badge, styles.badgeExclu, { backgroundColor: C.tertiaryContainer + 'E6', borderColor: C.onTertiaryContainer + '33' }]}>
            <Text style={[Typography.caption, styles.badgeText, { color: C.onTertiaryContainer }]}>EXCLUSIVITÉ</Text>
          </View>
        )}

        {/* Favorite */}
        <Pressable
          onPress={() => onLike?.(announce.id, announce.liked)}
          hitSlop={8}
          style={[styles.favBtn, { backgroundColor: C.surfaceContainerLowest + 'E6' }]}
        >
          <MaterialIcons
            name={announce.liked ? 'favorite' : 'favorite-border'}
            size={18}
            color={announce.liked ? C.error : C.onSurface}
          />
        </Pressable>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[Typography.bodyLg, styles.bold, styles.title, { color: C.onSurface }]} numberOfLines={1}>
            {announce.description.split('.')[0]}
          </Text>
          <ListingPriceTag price={announce.price} devise={announce.devise} period={announce.period} size="sm" />
        </View>

        <View style={styles.addressRow}>
          <MaterialIcons name="location-on" size={14} color={C.onSurfaceVariant} />
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, flex: 1 }]} numberOfLines={1}>
            {announce.address}, {announce.city}
          </Text>
        </View>

        {/* Stats footer */}
        {announce.type === 'realestate' && (
          <View style={[styles.statsRow, { borderTopColor: C.outlineVariant }]}>
            {announce.bedrooms != null && (
              <View style={styles.stat}>
                <MaterialIcons name="bed" size={14} color={C.onSurfaceVariant} />
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>{announce.bedrooms} Lits</Text>
              </View>
            )}
            {announce.size != null && (
              <View style={styles.stat}>
                <MaterialIcons name="square-foot" size={14} color={C.onSurfaceVariant} />
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>{announce.size} m²</Text>
              </View>
            )}
            <View style={styles.stat}>
              <MaterialIcons
                name={announce.ad_type === 'location' ? 'vpn-key' : 'sell'}
                size={14}
                color={C.onSurfaceVariant}
              />
              <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                {announce.ad_type === 'location' ? 'Location' : 'Vente'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeNew: {},
  badgeExclu: {},
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.8,
  },
  favBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bold: {
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  title: {
    flex: 1,
    fontSize: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
