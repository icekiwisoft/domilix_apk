import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Notification } from '@/types/notification';

type NotifIconConfig = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  bg: string;
  color: string;
};

function getIconConfig(type: string, C: (typeof Colors)['light']): NotifIconConfig {
  switch (type) {
    case 'announce_liked':
      return { icon: 'favorite', bg: C.errorContainer, color: C.error };
    case 'announce_unlocked':
      return { icon: 'lock-open', bg: C.secondaryContainer, color: C.secondary };
    case 'subscription':
      return { icon: 'workspace-premium', bg: C.primaryFixed, color: C.primary };
    case 'phone_verified':
      return { icon: 'verified', bg: C.primaryFixed, color: C.primary };
    case 'announcer_approved':
      return { icon: 'check-circle', bg: C.primaryFixed, color: C.primary };
    case 'system':
    default:
      return { icon: 'info', bg: C.surfaceContainerHigh, color: C.onSurfaceVariant };
  }
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });
}

interface NotifItemProps {
  notification: Notification;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

const SWIPE_THRESHOLD = -80;

export function NotifItem({ notification, onPress, onDelete }: NotifItemProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { icon, bg, color } = getIconConfig(notification.type, C);
  const isUnread = notification.read_at === null;

  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -120);
        deleteOpacity.value = Math.min((-e.translationX) / 80, 1);
      }
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD && onDelete) {
        translateX.value = withTiming(-400, { duration: 250 }, () => {
          runOnJS(onDelete)(notification.id);
        });
      } else {
        translateX.value = withTiming(0);
        deleteOpacity.value = withTiming(0);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      {/* Delete hint behind */}
      <Animated.View style={[styles.deleteHint, { backgroundColor: C.errorContainer }, deleteStyle]}>
        <MaterialIcons name="delete" size={22} color={C.error} />
      </Animated.View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[
            styles.item,
            {
              backgroundColor: isUnread ? C.surfaceContainerLow : C.surface,
              borderBottomColor: C.outlineVariant + '40',
            },
            animStyle,
          ]}
        >
          <Pressable onPress={onPress} style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: bg }]}>
              <MaterialIcons name={icon} size={20} color={color} />
            </View>

            {/* Text */}
            <View style={styles.textBlock}>
              <View style={styles.titleRow}>
                <Text
                  style={[Typography.labelSm, styles.title, { color: C.onSurface }]}
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>
                <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                  {formatTime(notification.created_at)}
                </Text>
              </View>
              <Text
                style={[Typography.bodyMd, styles.body, { color: C.onSurfaceVariant }]}
                numberOfLines={2}
              >
                {notification.body}
              </Text>
            </View>

            {/* Unread dot */}
            {isUnread && (
              <View style={[styles.dot, { backgroundColor: C.primary }]} />
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteHint: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    textTransform: 'none',
    letterSpacing: 0,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.sm,
    flexShrink: 0,
  },
});
