import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  const C = useThemeColors();
  // inverseOnSurface on inverseSurface 11.6:1 / 10.2:1, onError on error 6.5:1 / 7.7:1.
  const bgColor = toast.type === 'error' ? C.error : C.inverseSurface;
  const textColor: ColorToken = toast.type === 'error' ? 'onError' : 'inverseOnSurface';

  function dismiss() {
    onDismiss(toast.id);
  }

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 220 });
      translateY.value = withTiming(24, { duration: 220 }, (finished) => {
        if (finished) runOnJS(dismiss)();
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: bgColor }, animStyle]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Pressable
        onPress={dismiss}
        style={styles.toastInner}
        accessibilityRole="button"
        accessibilityLabel={toast.message}
        accessibilityHint="Touchez pour fermer"
      >
        <AppText color={textColor}>{toast.message}</AppText>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
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
    <ToastContext.Provider value={{ show }}>
      {children}
      <View
        pointerEvents="box-none"
        style={[styles.container, { bottom: insets.bottom + Spacing.md }]}
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
