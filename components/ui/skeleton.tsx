import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, radius = Radius.sm, style }: SkeletonProps) {
  const baseColor = useThemeColor({}, 'surfaceContainerHighest');
  const shimmerColor = useThemeColor({}, 'surfaceContainerLow');
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Reduce motion (Android "Remove animations"): a static placeholder. The
  // endless shimmer also keeps the UI thread busy, so uiautomator never sees
  // the app idle; reduce motion is how QA dumps a loading screen.
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    cancelAnimation(translateX);
    translateX.value = -containerWidth;
    if (containerWidth === 0 || reduceMotion) return;
    translateX.value = withRepeat(
      withTiming(containerWidth, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );
    // Stops the loop on unmount (and before restarting on a new width).
    return () => cancelAnimation(translateX);
  }, [containerWidth, reduceMotion, translateX]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      onLayout={handleLayout}
      style={[{ width, height, borderRadius: radius, backgroundColor: baseColor, overflow: 'hidden' }, style]}
    >
      {reduceMotion ? null : (
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: shimmerColor, opacity: 0.65 }, shimmerStyle]}
        />
      )}
    </View>
  );
}
