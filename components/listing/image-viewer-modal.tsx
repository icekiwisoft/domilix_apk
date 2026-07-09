import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';

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
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  const total = images.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <IconButton
          icon="close"
          iconColor="#fff"
          size={24}
          onPress={onClose}
          accessibilityLabel="Fermer"
          style={styles.closeBtn}
        />

        {total > 1 && (
          <Text style={styles.counter}>{index + 1} / {total}</Text>
        )}

        {images[index] && (
          <ZoomableImage uri={images[index]} width={width} height={height} />
        )}

        {total > 1 && (
          <View style={styles.navRow} pointerEvents="box-none">
            <IconButton
              icon="chevron-left"
              iconColor="#fff"
              size={28}
              disabled={index === 0}
              onPress={() => setIndex((i) => Math.max(0, i - 1))}
              accessibilityLabel="Photo précédente"
              style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
            />
            <IconButton
              icon="chevron-right"
              iconColor="#fff"
              size={28}
              disabled={index === total - 1}
              onPress={() => setIndex((i) => Math.min(total - 1, i + 1))}
              accessibilityLabel="Photo suivante"
              style={[styles.navBtn, index === total - 1 && styles.navBtnDisabled]}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    left: 8,
    zIndex: 10,
  },
  counter: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    color: '#fff',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    zIndex: 10,
  },
  navRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  navBtn: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
});
