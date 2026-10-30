import { useEffect, useState } from 'react';
import { Modal, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, IconButton } from '@/components/ui';
import { Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

const MAX_SCALE = 4;

interface ZoomableImageProps {
  uri: string;
  width: number;
  height: number;
}

function ZoomableImage({ uri, width, height }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  function reset() {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) reset();
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (savedScale.value <= 1) return;
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        reset();
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const gesture = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.Image
        source={{ uri }}
        style={[{ width, height }, animatedStyle]}
        resizeMode="contain"
      />
    </GestureDetector>
  );
}

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageViewerModal({ visible, images, initialIndex, onClose }: ImageViewerModalProps) {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  const total = images.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: C.viewer, alignItems: 'center', justifyContent: 'center' }}>
        {images[index] && <ZoomableImage uri={images[index]} width={width} height={height} />}

        <View
          style={{
            position: 'absolute',
            top: insets.top + Spacing.sm,
            left: Spacing.sm,
            right: Spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
          }}
        >
          <IconButton icon="close" label="Fermer" color="onViewer" background="photoBadge" onPress={onClose} />
          {total > 1 ? (
            <AppText
              variant="label"
              color="onViewer"
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Photo ${index + 1} sur ${total}`}
              style={{ flex: 1, textAlign: 'center', fontVariant: ['tabular-nums'] }}
            >
              {`${index + 1} / ${total}`}
            </AppText>
          ) : null}
          {/* Balances the close button so the counter stays centred. */}
          {total > 1 ? <View style={{ width: Sizes.touchTarget }} /> : null}
        </View>

        {total > 1 && (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              // Centred on the screen: the row is one 48 dp button tall.
              marginTop: -Sizes.touchTarget / 2,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: Spacing.xs,
            }}
          >
            <IconButton
              icon="chevron-left"
              label="Photo précédente"
              color="onViewer"
              background="photoBadge"
              disabled={index === 0}
              onPress={() => setIndex((i) => Math.max(0, i - 1))}
            />
            <IconButton
              icon="chevron-right"
              label="Photo suivante"
              color="onViewer"
              background="photoBadge"
              disabled={index === total - 1}
              onPress={() => setIndex((i) => Math.min(total - 1, i + 1))}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}
