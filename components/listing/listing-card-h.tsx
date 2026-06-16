import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ListingPriceTag } from './listing-price-tag';
import type { Announce } from '@/types/announce';

const PHOTO_SIZE = 100;

interface ListingCardHProps {
  announce: Announce;
  onPress?: () => void;
  onLike?: (id: string, liked: boolean) => void;
}

export function ListingCardH({ announce, onPress, onLike }: ListingCardHProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const thumb = announce.medias[0]?.thumbnail ?? announce.medias[0]?.file
    ?? `https://picsum.photos/seed/${announce.id}/300/300`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant + '77' },
        pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
      ]}
    >
      {/* Photo */}
      <View style={[styles.photoBox, { backgroundColor: C.surfaceContainerLow }]}>
        <Image source={{ uri: thumb }} style={styles.photo} resizeMode="cover" />
        {/* ad_type chip */}
        <View style={[styles.adChip, { backgroundColor: C.primary + 'DD' }]}>
          <Text style={[styles.adChipText, { color: C.onPrimary }]}>
            {announce.ad_type === 'location' ? 'Loc.' : 'Vente'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: C.onSurface }]} numberOfLines={2}>
          {announce.description.split('.')[0]}
        </Text>

        <View style={styles.addressRow}>
          <MaterialIcons name="location-on" size={12} color={C.primary} />
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1 }]} numberOfLines={1}>
            {announce.city}
          </Text>
        </View>

        <ListingPriceTag price={announce.price} devise={announce.devise} period={announce.period} size="sm" />

        {announce.type === 'realestate' && announce.bedrooms != null && (
          <View style={styles.metaRow}>
            <MaterialIcons name="bed" size={12} color={C.onSurfaceVariant} />
            <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>{announce.bedrooms} ch.</Text>
            {announce.size != null && (
              <>
                <Text style={[Typography.caption, { color: C.outlineVariant }]}>·</Text>
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>{announce.size} m²</Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Fav — 44×44 */}
      <Pressable
        onPress={() => onLike?.(announce.id, announce.liked)}
        hitSlop={4}
        style={({ pressed }) => [styles.favBtn, pressed && { opacity: 0.6 }]}
      >
        <MaterialIcons
          name={announce.liked ? 'favorite' : 'favorite-border'}
          size={20}
          color={announce.liked ? '#e53935' : C.onSurfaceVariant}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'stretch',
    ...Shadows.card,
  },
  photoBox: {
    width: PHOTO_SIZE,
    flexShrink: 0,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  adChip: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adChipText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.4,
  },
  info: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: 4,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favBtn: {
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
