import { useEffect } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_H } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapHeight?: number;
}

export function BottomSheet({ visible, onClose, title, children, snapHeight = SCREEN_H * 0.87 }: BottomSheetProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(snapHeight);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(snapHeight, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Scrim */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: C.surface,
              height: snapHeight,
              paddingBottom: insets.bottom,
            },
            sheetStyle,
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handleWrapper}>
            <View style={[styles.handle, { backgroundColor: C.surfaceVariant }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: C.surfaceVariant }]}>
            <Pressable onPress={onClose} hitSlop={8} style={styles.headerBtn}>
              <Text style={[Typography.labelSm, { color: C.onSurfaceVariant }]}>Réinitialiser</Text>
            </Pressable>
            {title && (
              <Text style={[Typography.headlineMd, styles.headerTitle, { color: C.onSurface }]}>
                {title}
              </Text>
            )}
            <Pressable onPress={onClose} hitSlop={8} style={[styles.headerBtn, styles.closeBtn]}>
              <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textAlign: 'right' }]}>Fermer</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: Spacing.xxl }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(32,27,21,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.10,
    shadowRadius: 40,
    elevation: 20,
  },
  handleWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: Radius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerBtn: {
    minWidth: 80,
  },
  closeBtn: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },
});
