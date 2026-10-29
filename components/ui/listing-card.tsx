import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Borders, Radii, Shadows, Sizes, Spacing, TextVariants } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { Badge } from './badge';
import { IconButton, type IconName } from './icon-button';
import { pressedStyle } from './pressed';
import { PriceTag, formatAmount, periodLabel } from './price-tag';
import { Skeleton } from './skeleton';

export interface ListingCardProps {
  title: string;
  /** "Quartier, Ville". */
  place: string;
  placeIcon?: IconName;
  imageUri?: string;
  /** Tag over the photo, "À louer" or "À vendre". */
  tag: string;
  /** Sale listings use the blue tag, so rent and sale are told apart by more than the word. */
  tagVariant?: 'rent' | 'sale';
  price: number;
  currency?: string;
  /** Shown after the currency ("FCFA / mois"); pass it only for rentals. */
  period?: string | null;
  onPress: () => void;
  /** Favourite button over the card; hidden when not given. */
  favorite?: boolean;
  onToggleFavorite?: () => void;
  /** vertical: photo on top (home, grids); compact: thumbnail on the left (lists, map preview). */
  variant?: 'vertical' | 'compact';
  style?: StyleProp<ViewStyle>;
}

/** Website card ratio (ProductCard image 5:3). */
const PHOTO_RATIO = 5 / 3;

function spokenSummary({ title, place, tag, price, currency = 'XAF', period }: ListingCardProps) {
  const unit = currency === 'XAF' ? 'francs CFA' : currency;
  const per = periodLabel(period);
  return `${title}, ${place}, ${tag}, ${formatAmount(price)} ${unit}${per ? ` par ${per}` : ''}`;
}

/**
 * Listing card of the website (ProductCard): photo with the rent / sale tag,
 * title on two lines, place and price (never split, lot 3). The card is one
 * TalkBack button that reads the whole summary; the favourite button is a
 * sibling, not nested, so TalkBack reaches it on its own (48 dp, "sélectionné"
 * when on, heart shape as well as colour).
 */
export function ListingCard(props: ListingCardProps) {
  const {
    title,
    place,
    placeIcon = 'location-on',
    imageUri,
    tag,
    tagVariant = 'rent',
    price,
    currency,
    period,
    onPress,
    favorite = false,
    onToggleFavorite,
    variant = 'vertical',
    style,
  } = props;
  const C = useThemeColors();
  const scheme = useColorScheme();
  const compact = variant === 'compact';
  const badge = <Badge label={tag} variant={tagVariant === 'sale' ? 'tertiary' : 'primary'} />;
  const favoriteLabel = favorite ? 'Retirer des favoris' : 'Ajouter aux favoris';

  const photo = (
    <View
      style={
        compact
          ? { width: Sizes.listingThumb, height: Sizes.listingThumb, borderRadius: Radii.control, overflow: 'hidden' }
          : { width: '100%', aspectRatio: PHOTO_RATIO }
      }
    >
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: C.surfaceContainerHigh }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            accessible={false}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="image" size={Sizes.iconLg} color={C.onSurfaceVariant} />
          </View>
        )}
      </View>
      <View style={compact ? { position: 'absolute', left: Spacing.xs, bottom: Spacing.xs, right: Spacing.xs } : { position: 'absolute', top: Spacing.ms, left: Spacing.ms, right: Sizes.touchTarget + Spacing.sm }}>
        {badge}
      </View>
    </View>
  );

  const info = (
    <View
      style={
        compact
          ? { flex: 1, minWidth: 0, gap: Spacing.xs, paddingRight: onToggleFavorite ? Sizes.touchTarget - Spacing.sm : 0 }
          : { gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingTop: Spacing.ms, paddingBottom: Spacing.md }
      }
    >
      <AppText variant={compact ? 'label' : 'bodyStrong'} numberOfLines={2} style={compact ? null : { lineHeight: TextVariants.headline.lineHeight }}>
        {title}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
        <MaterialIcons name={placeIcon} size={Sizes.iconSm} color={C.onSurfaceVariant} />
        <AppText variant="caption" color="onSurfaceVariant" numberOfLines={1} style={{ flex: 1 }}>
          {place}
        </AppText>
      </View>
      <PriceTag
        amount={price}
        currency={currency}
        period={period}
        size={compact ? 'sm' : 'md'}
        color="onSurface"
        style={compact ? { marginTop: 'auto' } : { marginTop: Spacing.xxs }}
      />
    </View>
  );

  // Website card: shadow in light, a hairline edge in dark where a shadow does not show.
  const surface: ViewStyle[] = [
    { backgroundColor: C.surfaceContainerLowest, borderRadius: Radii.card, borderCurve: 'continuous' },
    scheme === 'dark' ? { borderWidth: Borders.thin, borderColor: C.outlineVariant } : Shadows.card,
  ];

  return (
    <View style={[...surface, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={spokenSummary(props)}
        onPress={onPress}
        style={({ pressed }) => [
          { borderRadius: Radii.card, overflow: 'hidden' },
          compact ? { flexDirection: 'row', gap: Spacing.ms, padding: Spacing.sm } : null,
          pressedStyle(pressed),
        ]}
      >
        {photo}
        {info}
      </Pressable>
      {onToggleFavorite ? (
        <IconButton
          icon="favorite-border"
          selectedIcon="favorite"
          selected={favorite}
          label={favoriteLabel}
          overlay={!compact}
          color={compact ? 'onSurfaceVariant' : undefined}
          selectedColor={compact ? 'error' : undefined}
          onPress={onToggleFavorite}
          style={{ position: 'absolute', top: Spacing.xs, right: Spacing.xs }}
        />
      ) : null}
    </View>
  );
}

/** Loading placeholder with the shape of a ListingCard. */
export function ListingCardSkeleton({
  variant = 'vertical',
  style,
}: {
  variant?: 'vertical' | 'compact';
  style?: StyleProp<ViewStyle>;
}) {
  const C = useThemeColors();
  const line = TextVariants.body.fontSize;
  const compact = variant === 'compact';
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          backgroundColor: C.surfaceContainerLowest,
          borderRadius: Radii.card,
          overflow: 'hidden',
          borderWidth: Borders.thin,
          borderColor: C.outlineVariant,
        },
        compact ? { flexDirection: 'row', gap: Spacing.ms, padding: Spacing.sm } : null,
        style,
      ]}
    >
      {compact ? (
        <Skeleton width={Sizes.listingThumb} height={Sizes.listingThumb} radius={Radii.control} />
      ) : (
        <View style={{ width: '100%', aspectRatio: PHOTO_RATIO }}>
          <Skeleton height={Sizes.listingCardWidth / PHOTO_RATIO} radius={0} style={{ height: '100%' }} />
        </View>
      )}
      <View style={[{ gap: Spacing.sm }, compact ? { flex: 1, paddingTop: Spacing.xs } : { padding: Spacing.md }]}>
        <Skeleton width="85%" height={line} />
        <Skeleton width="55%" height={line} />
        <Skeleton width="40%" height={line} />
      </View>
    </View>
  );
}
