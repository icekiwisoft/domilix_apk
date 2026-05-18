import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Media } from '@/types/announce';

const { width: SCREEN_W } = Dimensions.get('window');
const DEFAULT_HEIGHT = 280;
const PLACEHOLDER = 'https://picsum.photos/seed/domilix-placeholder/800/600';

interface ListingGalleryProps {
  medias: Media[];
  height?: number;
  announceId?: string;
}

export function ListingGallery({ medias, height = DEFAULT_HEIGHT, announceId }: ListingGalleryProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const scrollX = useSharedValue(0);

  const sources = medias.length > 0
    ? medias.map((m) => m.file)
    : [`https://picsum.photos/seed/${announceId ?? 'domilix'}/800/600`];

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

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
          <View key={i} style={{ width: SCREEN_W, height }}>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </Animated.ScrollView>

      {/* Dots */}
      {sources.length > 1 && (
        <View style={styles.dots}>
          {sources.map((_, i) => (
            <GalleryDot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>
      )}
    </View>
  );
}

function GalleryDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W];
    const width = interpolate(scrollX.value, inputRange, [8, 10, 8], 'clamp');
    const height = interpolate(scrollX.value, inputRange, [8, 10, 8], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], 'clamp');
    return { width, height, opacity };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: '#ffffff' },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
});
