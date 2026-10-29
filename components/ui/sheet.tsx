import { useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radii, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { useKeyboardShown } from './screen';
import { SheetHeader } from './sheet-header';

const OPEN_MS = 240;
const CLOSE_MS = 200;
/** Largest share of the window height the sheet takes; the content scrolls beyond. */
const MAX_HEIGHT = 0.9;

export interface SheetProps {
  visible: boolean;
  /** Back button, close button and scrim tap. */
  onClose: () => void;
  title: string;
  closeLabel?: string;
  children: ReactNode;
  /** Fixed under the scrolling content (Appliquer / Réinitialiser), above the gesture bar. */
  footer?: ReactNode;
}

/**
 * Modal bottom sheet: scrim, rounded top, SheetHeader (handle, title, 48 dp
 * close), scrolling content and an optional fixed footer. Safe areas are
 * handled, the keyboard pushes the sheet up (fields in a filter), the
 * Android back button closes it, and TalkBack stays inside it while open.
 */
export function Sheet({ visible, onClose, title, closeLabel, children, footer }: SheetProps) {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Resting on the keyboard, the bottom of the sheet needs no gesture-bar inset.
  const bottom = useKeyboardShown(visible) ? 0 : insets.bottom;
  // Stay mounted during the closing animation.
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: OPEN_MS });
    } else {
      progress.value = withTiming(0, { duration: CLOSE_MS }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * height }] }));

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {/* 'padding' on Android too: with edge-to-edge the window is not resized (lot 2). */}
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }, scrimStyle]}>
          <Pressable style={styles.fill} onPress={onClose} accessible={false} importantForAccessibility="no" />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              maxHeight: height * MAX_HEIGHT,
              marginTop: 'auto',
              borderTopLeftRadius: Radii.card,
              borderTopRightRadius: Radii.card,
              backgroundColor: C.surface,
              paddingBottom: footer ? 0 : bottom,
            },
            Shadows.floating,
            sheetStyle,
          ]}
        >
          <View style={{ paddingHorizontal: Spacing.marginMobile }}>
            <SheetHeader title={title} onClose={onClose} closeLabel={closeLabel} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: Spacing.marginMobile, gap: Spacing.lg }}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View
              style={{
                paddingHorizontal: Spacing.marginMobile,
                paddingTop: Spacing.sm,
                paddingBottom: bottom + Spacing.sm,
                gap: Spacing.sm,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: C.outlineVariant,
              }}
            >
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
