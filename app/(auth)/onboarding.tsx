import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ListRenderItemInfo,
    type ViewToken,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppStorage } from '@/lib/app-storage';

const { width: SCREEN_W } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Slide>);

interface Slide {
  id: string;
  image: string;
  headline: string;
  sub: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    image: 'https://picsum.photos/seed/domilix1/600/750',
    headline: 'Trouvez votre prochain chez-vous avec élégance.',
    sub: "Des propriétés d'exception à Douala et Yaoundé.",
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/domilix2/600/750',
    headline: 'Des meubles haut de gamme livrés chez vous.',
    sub: 'Mobilier premium sélectionné par nos experts.',
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/domilix3/600/750',
    headline: 'Votre prochaine adresse commence ici.',
    sub: "Rejoignez une communauté d'excellence immobilière.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<Slide>>(null);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
    }
  ).current;

  const markSeenAndGo = useCallback(async (destination: Parameters<typeof router.replace>[0]) => {
    await AppStorage.markOnboardingSeen();
    router.replace(destination);
  }, []);

  function goNext() {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      markSeenAndGo('/(auth)/login');
    }
  }

  function renderItem({ item }: ListRenderItemInfo<Slide>) {
    return (
      <View style={[styles.slide, { width: SCREEN_W }]}>
        <View style={[styles.imageContainer, { backgroundColor: C.surfaceContainer }]}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.textBlock}>
          <Text 
            style={[Typography.headlineLg, styles.headline, { color: C.onSurface }]}
            numberOfLines={undefined}
            allowFontScaling
          >
            {item.headline}
          </Text>
          <Text 
            style={[Typography.bodyMd, styles.sub, { color: C.onSurfaceVariant }]}
            numberOfLines={undefined}
            allowFontScaling
          >
            {item.sub}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: C.surface }]}>
      {/* slides */}
      <AnimatedFlatList
        ref={flatRef as any}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={{ marginTop: insets.top + Spacing.md }}
      />

      {/* bottom section */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {/* dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} color={C.primary} inactive={C.surfaceVariant} />
          ))}
        </View>

        {/* primary CTA */}
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.btn, styles.btnPrimary,
            { backgroundColor: C.primary },
            pressed && { opacity: 0.87, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Text style={[Typography.labelSm, styles.btnLabel, { color: C.onPrimary }]}>
            {activeIndex < SLIDES.length - 1 ? 'Suivant' : 'Commencer'}
          </Text>
        </Pressable>

        {/* ghost CTA */}
        <Pressable
          onPress={() => markSeenAndGo('/(auth)/login')}
          style={({ pressed }) => [
            styles.btn, styles.btnGhost,
            { borderColor: C.outlineVariant },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[Typography.labelSm, styles.btnLabel, { color: C.onSurface }]}>
            {"J'ai déjà un compte"}
          </Text>
        </Pressable>

        {/* guest link */}
        <Pressable onPress={() => markSeenAndGo('/(tabs)')} hitSlop={12} style={{ paddingVertical: 4 }}>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', fontSize: 13 }]}>
            Continuer sans compte
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Dot({
  index,
  scrollX,
  color,
  inactive,
}: {
  index: number;
  scrollX: SharedValue<number>;
  color: string;
  inactive: string;
}) {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W];
    const width = interpolate(scrollX.value, inputRange, [10, 24, 10], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], 'clamp');
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slide: {
    paddingHorizontal: Spacing.marginMobile,
    flex: 1,
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    flexShrink: 0,
    ...{
      shadowColor: 'rgb(82,69,52)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
      elevation: 2,
    },
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  headline: {
    textAlign: 'center',
    flexWrap: 'wrap',
    numberOfLines: undefined,
  },
  sub: {
    textAlign: 'center',
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
    numberOfLines: undefined,
  },
  bottom: {
    paddingHorizontal: Spacing.marginMobile,
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dot: {
    height: 10,
    borderRadius: Radius.full,
  },
  btn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  onboardingBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: 'rgb(232, 146, 26)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimary: {
    shadowColor: 'rgb(232, 146, 26)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  btnGhost: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  btnLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.12,
  },
});
