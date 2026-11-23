import { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTourStore } from '@/stores/tour.store';
import { getTourTarget } from './tour-target';

export interface TourStep {
  target: string;
  title: string;
  text: string;
}

interface Rect { x: number; y: number; width: number; height: number }

const PADDING = 6;
const DIM = 'rgba(10, 14, 30, 0.72)';

function measure(id: string) {
  return new Promise<Rect | null>((resolve) => {
    const node = getTourTarget(id);
    if (!node) return resolve(null);
    node.measureInWindow((x, y, width, height) => {
      // Skip elements that are hidden or scrolled out of view.
      const visible = width > 0 && height > 0 && y >= 0 && y + height <= Dimensions.get('window').height + 1;
      resolve(visible ? { x, y, width, height } : null);
    });
  });
}

function Finger() {
  const offset = useSharedValue(0);
  useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 450, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 450, easing: Easing.in(Easing.quad) }),
      ),
      -1,
    );
  }, [offset]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  return (
    <Animated.View style={[styles.finger, style]}>
      <MaterialIcons name="touch-app" size={46} color="#ffffff" />
    </Animated.View>
  );
}

// Coach marks: dims the screen, highlights one element at a time and points
// at it with an animated finger. Shown once per tour id (stores/tour.store.ts);
// steps whose element is not on screen are skipped.
export function GuidedTour({ tourId, steps, delay = 900, enabled = true }: {
  tourId: string;
  steps: TourStep[];
  delay?: number;
  enabled?: boolean;
}) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { width: screenW, height: screenH } = useWindowDimensions();
  const hydrated = useTourStore((s) => s.hydrated);
  const seen = useTourStore((s) => s.seen.includes(tourId));
  const markSeen = useTourStore((s) => s.markSeen);
  const [index, setIndex] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  // Find the first step from `from` whose element can be measured.
  async function show(from: number) {
    for (let i = from; i < steps.length; i += 1) {
      const found = await measure(steps[i].target);
      if (found) {
        setRect(found);
        setIndex(i);
        return;
      }
    }
    finish();
  }

  function finish() {
    setIndex(null);
    setRect(null);
    markSeen(tourId);
  }

  useEffect(() => {
    if (!enabled || !hydrated || seen) return;
    const timer = setTimeout(() => { void show(0); }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hydrated, seen, tourId]);

  if (index === null || !rect) return null;
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const hole = {
    x: Math.max(0, rect.x - PADDING),
    y: Math.max(0, rect.y - PADDING),
    width: Math.min(screenW, rect.width + PADDING * 2),
    height: rect.height + PADDING * 2,
  };
  const fingerX = Math.min(screenW - 54, Math.max(4, rect.x + rect.width / 2 - 23));
  const fingerY = Math.min(screenH - 60, hole.y + hole.height - 18);
  const tooltipBelow = hole.y + hole.height + 230 < screenH;
  const tooltipStyle = tooltipBelow
    ? { top: fingerY + 52 }
    : { bottom: screenH - hole.y + 12 };

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={finish}>
      <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
        {/* Dimmed frame around the highlighted element */}
        <View style={[styles.dim, { top: 0, left: 0, right: 0, height: hole.y }]} />
        <View style={[styles.dim, { top: hole.y + hole.height, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.dim, { top: hole.y, left: 0, width: hole.x, height: hole.height }]} />
        <View style={[styles.dim, { top: hole.y, left: hole.x + hole.width, right: 0, height: hole.height }]} />
        <Pressable
          onPress={() => (isLast ? finish() : void show(index + 1))}
          accessibilityLabel="Étape suivante"
          style={[styles.hole, { left: hole.x, top: hole.y, width: hole.width, height: hole.height, borderColor: C.primary }]}
        />

        <View pointerEvents="none" style={{ position: 'absolute', left: fingerX, top: fingerY }}>
          <Finger />
        </View>

        <View style={[styles.tooltip, tooltipStyle, { backgroundColor: C.surface }]}>
          <Text style={[Typography.caption, { color: C.primary, fontWeight: '700' }]}>
            Étape {index + 1} sur {steps.length}
          </Text>
          <Text style={[Typography.headlineSm, { color: C.onSurface, fontSize: 18 }]}>{step.title}</Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 21 }]}>{step.text}</Text>
          <View style={styles.actions}>
            <Pressable onPress={finish} hitSlop={10} accessibilityRole="button">
              <Text style={[Typography.labelSm, { color: C.onSurfaceVariant }]}>Passer le guide</Text>
            </Pressable>
            <Pressable
              onPress={() => (isLast ? finish() : void show(index + 1))}
              accessibilityRole="button"
              style={[styles.next, { backgroundColor: C.primary }]}
            >
              <Text style={[Typography.labelSm, { color: C.onPrimary }]}>{isLast ? 'Terminer' : 'Suivant'}</Text>
              {!isLast && <MaterialIcons name="arrow-forward" size={16} color={C.onPrimary} />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute', backgroundColor: DIM },
  hole: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: Radius.md,
  },
  finger: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  tooltip: {
    position: 'absolute',
    left: Spacing.marginMobile,
    right: Spacing.marginMobile,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 6,
    elevation: 12,
  },
  actions: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
});
