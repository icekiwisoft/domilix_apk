import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { AppText } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import type { Media } from '@/types/announce';

import { ImageViewerModal } from './image-viewer-modal';

interface ListingGalleryProps {
  medias: Media[];
  height: number;
  announceId?: string;
  /** Height covered at the bottom by the content card, kept clear for the counter. */
  bottomInset?: number;
}

/**
 * Swipeable photos of a listing, full width. A tap opens the full-screen
 * viewer at the same photo; the "2 / 8" counter tells where the user is.
 */
export function ListingGallery({ medias, height, announceId, bottomInset = 0 }: ListingGalleryProps) {
  const C = useThemeColors();
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  const sources =
    medias.length > 0 ? medias.map((m) => m.file) : [`https://picsum.photos/seed/${announceId ?? 'domilix'}/800/600`];
  const total = sources.length;

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  useAnimatedReaction(
    () => Math.round(scrollX.value / width),
    (index) => {
      const clamped = Math.min(Math.max(index, 0), total - 1);
      runOnJS(setCurrentIndex)(clamped);
    },
  );

  return (
    <View style={{ height, backgroundColor: C.surfaceContainerHigh }}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {sources.map((uri, i) => (
          <Pressable
            key={`${i}-${uri}`}
            style={{ width, height }}
            onPress={() => setViewerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={
              total > 1 ? `Photo ${i + 1} sur ${total}, voir en plein écran` : 'Voir la photo en plein écran'
            }
          >
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              accessible={false}
            />
          </Pressable>
        ))}
      </Animated.ScrollView>

      {total > 1 ? (
        <View
          importantForAccessibility="no-hide-descendants"
          style={{
            position: 'absolute',
            right: Spacing.md,
            bottom: bottomInset + Spacing.sm,
            paddingHorizontal: Spacing.ms,
            paddingVertical: Spacing.xxs,
            borderRadius: Radii.full,
            backgroundColor: C.photoBadge,
          }}
        >
          <AppText variant="label" color="onPhotoBadge" style={{ fontVariant: ['tabular-nums'] }}>
            {`${currentIndex + 1} / ${total}`}
          </AppText>
        </View>
      ) : null}

      <ImageViewerModal
        visible={viewerVisible}
        images={sources}
        initialIndex={currentIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
