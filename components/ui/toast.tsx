import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';

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

  const inverseSurface = useThemeColor({}, 'inverseSurface');
  const inverseOnSurface = useThemeColor({}, 'inverseOnSurface');
  const errorColor = useThemeColor({}, 'error');

  const bgColor = toast.type === 'error' ? errorColor : inverseSurface;
  const textColor = toast.type === 'error' ? '#ffffff' : inverseOnSurface;

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
    <Animated.View style={[styles.toast, { backgroundColor: bgColor }, animStyle]}>
      <Pressable onPress={dismiss} style={styles.toastInner}>
        <Text style={[Typography.bodyMd, { color: textColor }]}>{toast.message}</Text>
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
    borderRadius: Radius.lg,
    ...Shadows.card,
  },
  toastInner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
});
