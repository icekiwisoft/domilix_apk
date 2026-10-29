import { useFocusEffect } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radii, Shadows, Sizes, Spacing, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';

export type ToastType = 'info' | 'success' | 'error';

/** Time on screen, lengthened by Android's accessibility timeout setting. */
const BASE_DURATION = 3500;
const ENTER = { damping: 18, stiffness: 200 };
const SLIDE = 80;
const FADE_IN = 200;
const FADE_OUT = 220;

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
  /** Distance kept from the bottom of the screen (tab bar height), 0 for none. */
  setOffset: (offset: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {}, setOffset: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/**
 * Keeps toasts above a bottom bar while the calling screen or layout is
 * focused, e.g. `useToastOffset(tabBarHeight)` in the tabs layout.
 */
export function useToastOffset(offset: number) {
  const { setOffset } = useContext(ToastContext);
  useFocusEffect(
    useCallback(() => {
      setOffset(offset);
      return () => setOffset(0);
    }, [offset, setOffset]),
  );
}

// Contrast: inverseOnSurface on inverseSurface 11.6:1 / 10.2:1; onError on
// error 6.5:1 / 7.7:1; onSuccess on success 6.39:1 / 8.33:1.
const PALETTE: Record<ToastType, { bg: ColorToken; fg: ColorToken; prefix: string }> = {
  info: { bg: 'inverseSurface', fg: 'inverseOnSurface', prefix: '' },
  success: { bg: 'success', fg: 'onSuccess', prefix: '' },
  error: { bg: 'error', fg: 'onError', prefix: 'Erreur : ' },
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const translateY = useSharedValue(SLIDE);
  const opacity = useSharedValue(0);
  const C = useThemeColors();
  const p = PALETTE[toast.type];
  const spoken = `${p.prefix}${toast.message}`;
  const dismissRef = useRef(() => onDismiss(toast.id));
  dismissRef.current = () => onDismiss(toast.id);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const finish = () => dismissRef.current();
    translateY.value = withSpring(0, ENTER);
    opacity.value = withTiming(1, { duration: FADE_IN });
    AccessibilityInfo.announceForAccessibility(spoken);
    AccessibilityInfo.getRecommendedTimeoutMillis(BASE_DURATION)
      .catch(() => BASE_DURATION)
      .then((duration) => {
        if (cancelled) return;
        timer = setTimeout(() => {
          opacity.value = withTiming(0, { duration: FADE_OUT });
          translateY.value = withTiming(Spacing.lg, { duration: FADE_OUT }, (finished) => {
            if (finished) runOnJS(finish)();
          });
        }, duration);
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [opacity, translateY, spoken]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.toast, { backgroundColor: C[p.bg] }, animStyle]}>
      <Pressable
        onPress={() => dismissRef.current()}
        style={styles.toastInner}
        accessibilityRole="button"
        accessibilityLabel={spoken}
        accessibilityHint="Touchez pour fermer"
      >
        <AppText color={p.fg}>{toast.message}</AppText>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Short messages at the bottom of the screen. Each one is announced by
 * TalkBack when it appears (not through a live region, which Android does
 * not reliably read for a newly mounted view), stays for the user's
 * accessibility timeout, and keeps above the tab bar (`useToastOffset`).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [offset, setOffset] = useState(0);
  const insets = useSafeAreaInsets();
  const counter = useRef(0);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(++counter.current);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show, setOffset }}>
      {children}
      <View
        pointerEvents="box-none"
        style={[styles.container, { bottom: Math.max(insets.bottom, offset) + Spacing.md }]}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.marginMobile,
    right: Spacing.marginMobile,
    zIndex: 9999,
    gap: Spacing.sm,
  },
  toast: {
    borderRadius: Radii.card,
    ...Shadows.card,
  },
  toastInner: {
    minHeight: Sizes.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.ms,
  },
});
