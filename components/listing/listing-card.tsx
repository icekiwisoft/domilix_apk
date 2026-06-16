import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Announce } from '@/types/announce';
import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const IMAGE_HEIGHT = 128;

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}k`;
  return price.toLocaleString('fr-FR');
}

interface ListingCardProps {
  announce: Announce;
  onPress?: () => void;
  onLike?: (id: string, liked: boolean) => void;
}

export function ListingCard({ announce, onPress, onLike }: ListingCardProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const thumb = announce.medias[0]?.thumbnail ?? announce.medias[0]?.file
    ?? `https://picsum.photos/seed/${announce.id}/800/600`;

  const isLocation = announce.ad_type === 'location';
  const chipBg = isLocation ? C.tertiary : C.tertiaryContainer;
  const chipColor = isLocation ? C.onTertiary : C.onTertiaryContainer;
  const chipLabel = isLocation ? 'À Louer' : 'À Vendre';

  const locationIcon: React.ComponentProps<typeof MaterialIcons>['name'] =
    announce.type === 'furniture' ? 'storefront' : 'location-on';
  const locationText = announce.neighborhood ?? announce.address ?? announce.city;

  const currency = announce.devise === 'XAF' ? 'FCFA' : announce.devise;
  const periodSuffix =
    announce.period === 'month' ? '/mois'
    : announce.period === 'year' ? '/an'
    : announce.period === 'day' ? '/jour'
    : '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant + '55' },
        pressed && { opacity: 0.93, transform: [{ scale: 0.985 }] },
      ]}
    >
      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: thumb }} style={styles.image} resizeMode="cover" />

        {/* Ad-type chip — top left */}
        <View style={[styles.adChip, { backgroundColor: chipBg }]}>
          <Text style={[styles.adChipText, { color: chipColor }]}>{chipLabel}</Text>
        </View>

        {/* Fav button — top right */}
        <Pressable
          onPress={() => onLike?.(announce.id, announce.liked)}
          hitSlop={4}
          style={({ pressed }) => [
            styles.favBtn,
            { backgroundColor: pressed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)' },
          ]}
        >
          <MaterialIcons
            name={announce.liked ? 'favorite' : 'favorite-border'}
            size={20}
            color={announce.liked ? '#e53935' : C.secondary}
          />
        </Pressable>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: C.onSurface }]} numberOfLines={1}>
          {announce.description.split('.')[0]}
        </Text>
        <View style={styles.locationRow}>
          <MaterialIcons name={locationIcon} size={13} color={C.secondary} />
          <Text style={[Typography.caption, { color: C.secondary, flex: 1 }]} numberOfLines={1}>
            {locationText}, {announce.city}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.priceRow}>
          <Text style={[styles.priceMain, { color: C.primary }]}>
            {formatPrice(announce.price)}{' '}
            <Text style={[Typography.caption, { color: C.secondary }]}>
              {currency}{periodSuffix}
            </Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 1,
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  adChip: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adChipText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
  },
  favBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: Spacing.sm,
    gap: 2,
  },
  title: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  priceRow: {},
  priceMain: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
});
