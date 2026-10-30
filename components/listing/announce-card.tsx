import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { ListingCard } from '@/components/ui';
import type { Announce } from '@/types/announce';

export interface AnnounceCardProps {
  announce: Announce;
  onPress: () => void;
  onToggleFavorite?: (id: string) => void;
  variant?: 'vertical' | 'compact';
  /** Content under the card, inside its surface (owner actions). */
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** First sentence of the description: the API has no separate title. */
export function announceTitle(a: Announce) {
  // Line breaks of the description would leave an empty second line on the card.
  return a.description.split('.')[0].replace(/\s+/g, ' ').trim();
}

/** "Quartier, Ville" without repeating the city when the API has no district. */
export function announcePlace(a: Announce) {
  const local = a.neighborhood ?? a.address ?? a.city;
  return local && local !== a.city ? `${local}, ${a.city}` : a.city;
}

/** Announce → kit ListingCard (UI-07). */
export function AnnounceCard({ announce: a, onPress, onToggleFavorite, variant, footer, style }: AnnounceCardProps) {
  const rent = a.ad_type === 'location';
  const thumb = a.medias[0]?.thumbnail ?? a.medias[0]?.file ?? `https://picsum.photos/seed/${a.id}/800/600`;
  return (
    <ListingCard
      variant={variant}
      title={announceTitle(a)}
      place={announcePlace(a)}
      placeIcon={a.type === 'furniture' ? 'storefront' : 'location-on'}
      imageUri={thumb}
      tag={rent ? 'À louer' : 'À vendre'}
      tagVariant={rent ? 'rent' : 'sale'}
      price={a.price}
      currency={a.devise}
      // Like the website card: the period only for rentals.
      period={rent ? a.period : null}
      onPress={onPress}
      favorite={a.liked}
      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(a.id) : undefined}
      footer={footer}
      style={style}
    />
  );
}
