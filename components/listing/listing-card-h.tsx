import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ListingPriceTag } from './listing-price-tag';
import type { Announce } from '@/types/announce';

const PHOTO_SIZE = 90;

interface ListingCardHProps {
  announce: Announce;
  onPress?: () => void;
  onLike?: (id: string, liked: boolean) => void;
}

export function ListingCardH({ announce, onPress, onLike }: ListingCardHProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const thumb = announce.medias[0]?.url ?? `https://picsum.photos/seed/${announce.id}/300/300`;

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
      {/* Photo */}
      <View style={[styles.photoBox, { backgroundColor: C.surfaceContainerLow }]}>
        <Image source={{ uri: thumb }} style={styles.photo} resizeMode="cover" />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[Typography.labelSm, styles.title, { color: C.onSurface }]} numberOfLines={1}>
          {announce.description.split('.')[0]}
        </Text>

        <View style={styles.addressRow}>
          <MaterialIcons name="location-on" size={12} color={C.onSurfaceVariant} />
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1 }]} numberOfLines={1}>
            {announce.city}
          </Text>
        </View>

        <ListingPriceTag
          price={announce.price}
          devise={announce.devise}
          period={announce.period}
          size="sm"
        />

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

      {/* Favorite */}
      <Pressable
        onPress={() => onLike?.(announce.id, announce.liked)}
        hitSlop={8}
        style={styles.favBtn}
      >
        <MaterialIcons
          name={announce.liked ? 'favorite' : 'favorite-border'}
          size={18}
          color={announce.liked ? C.error : C.onSurfaceVariant}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    ...Shadows.card,
  },
  photoBox: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    flexShrink: 0,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: 3,
  },
  title: {
    letterSpacing: 0,
    fontSize: 13,
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
    paddingHorizontal: Spacing.sm,
    alignSelf: 'center',
  },
});
