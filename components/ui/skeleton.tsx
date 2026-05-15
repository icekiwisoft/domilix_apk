import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
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

  useEffect(() => {
    if (containerWidth === 0) return;
    cancelAnimation(translateX);
    translateX.value = -containerWidth;
    translateX.value = withRepeat(
      withTiming(containerWidth, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(translateX);
  }, [containerWidth]);

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
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: shimmerColor, opacity: 0.65 }, shimmerStyle]}
      />
    </View>
  );
}
