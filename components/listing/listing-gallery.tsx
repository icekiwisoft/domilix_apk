import { useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ImageViewerModal } from './image-viewer-modal';
import type { Media } from '@/types/announce';

const { width: SCREEN_W } = Dimensions.get('window');
const DEFAULT_HEIGHT = 280;

interface ListingGalleryProps {
  medias: Media[];
  height?: number;
  announceId?: string;
}

export function ListingGallery({ medias, height = DEFAULT_HEIGHT, announceId }: ListingGalleryProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  const sources = medias.length > 0
    ? medias.map((m) => m.file)
    : [`https://picsum.photos/seed/${announceId ?? 'domilix'}/800/600`];

  const total = sources.length;

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  useAnimatedReaction(
    () => Math.round(scrollX.value / SCREEN_W),
    (index) => {
      const clamped = Math.min(Math.max(index, 0), total - 1);
      runOnJS(setCurrentIndex)(clamped);
    },
  );

  return (
    <View style={{ height }}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {sources.map((uri, i) => (
          <Pressable
            key={i}
            style={{ width: SCREEN_W, height }}
            onPress={() => setViewerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Voir la photo en plein écran"
          >
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          </Pressable>
        ))}
      </Animated.ScrollView>

      {/* Pagination counter — only if multiple images */}
      {total > 1 && (
        <View style={[styles.counter, { backgroundColor: 'rgba(32,27,21,0.62)' }]}>
          <Text style={[styles.counterText, { color: '#ffffff' }]}>
            <Text style={styles.counterCurrent}>{currentIndex + 1}</Text>
            <Text style={styles.counterSep}> / </Text>
            <Text>{total}</Text>
          </Text>
        </View>
      )}

      <ImageViewerModal
        visible={viewerVisible}
        images={sources}
        initialIndex={currentIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  counter: {
    position: 'absolute',
    // Clears the content card's -24 overlap (see app/announces/[id].tsx) so the pill isn't clipped.
    bottom: Spacing.xl,
    right: Spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  counterText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  counterCurrent: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
  },
  counterSep: {
    fontFamily: 'PlusJakartaSans_400Regular',
    opacity: 0.7,
  },
});
