import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppText, pressedStyle, type IconName } from '@/components/ui';
import { Borders, Radii, Sizes, Spacing, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import type { Notification } from '@/types/notification';

type Tone = { icon: IconName; bg: ColorToken; fg: ColorToken };

// Container / on-container pairs of the theme (AA in both themes), as in the
// mockup: amber for money and listings, green for an unlocked contact, blue
// for account events.
function toneOf(type: string): Tone {
  switch (type) {
    case 'payment_success':
      return { icon: 'payment', bg: 'primaryFixed', fg: 'onPrimaryFixed' };
    case 'credits_received':
      return { icon: 'toll', bg: 'primaryFixed', fg: 'onPrimaryFixed' };
    case 'signup_gift_received':
      return { icon: 'card-giftcard', bg: 'tertiaryContainer', fg: 'onTertiaryContainer' };
    case 'ad_unlocked':
      return { icon: 'lock-open', bg: 'successContainer', fg: 'onSuccessContainer' };
    case 'ad_published':
      return { icon: 'campaign', bg: 'primaryFixed', fg: 'onPrimaryFixed' };
    case 'welcome':
      return { icon: 'celebration', bg: 'tertiaryContainer', fg: 'onTertiaryContainer' };
    case 'new_login':
      return { icon: 'login', bg: 'tertiaryContainer', fg: 'onTertiaryContainer' };
    case 'announcer_subscription_assigned':
      return { icon: 'workspace-premium', bg: 'primaryFixed', fg: 'onPrimaryFixed' };
    default:
      return { icon: 'info', bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant' };
  }
}

/** Hour for today and yesterday (the group says the day), the date before. */
function formatWhen(iso: string): string {
  const date = new Date(iso);
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date >= yesterday) return date.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });
  const otherYear = date.getFullYear() !== new Date().getFullYear();
  return date.toLocaleDateString('fr', { day: 'numeric', month: 'short', year: otherYear ? 'numeric' : undefined });
}

interface NotifItemProps {
  notification: Notification;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

/** Distance (dp) past which a left swipe deletes the notification. */
const SWIPE_THRESHOLD = Sizes.touchTarget + Spacing.xl;

/**
 * Notification row (mockup Notifications): round tone icon, title, text and
 * time, unread rows on a tinted surface with a dot and a bolder title. Swipe
 * left to delete; TalkBack gets a "Supprimer" action instead.
 */
export function NotifItem({ notification, onPress, onDelete }: NotifItemProps) {
  const C = useThemeColors();
  const tone = toneOf(notification.type);
  const isUnread = notification.read_at === null;
  const when = formatWhen(notification.created_at);
  // Only the parts the API sent: a missing body was read as "undefined" (QA-11).
  const spoken = [isUnread ? 'Non lue' : null, notification.title, notification.body, when]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join('. ');

  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-Spacing.ms, Spacing.ms])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -SWIPE_THRESHOLD * 1.5);
        deleteOpacity.value = Math.min(-e.translationX / SWIPE_THRESHOLD, 1);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD && onDelete) {
        translateX.value = withTiming(-SWIPE_THRESHOLD * 5, { duration: 250 }, () => {
          runOnJS(onDelete)(notification.id);
        });
      } else {
        translateX.value = withTiming(0);
        deleteOpacity.value = withTiming(0);
      }
    });

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const deleteStyle = useAnimatedStyle(() => ({ opacity: deleteOpacity.value }));

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.View
        importantForAccessibility="no-hide-descendants"
        style={[
          {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: SWIPE_THRESHOLD,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: C.errorContainer,
          },
          deleteStyle,
        ]}
      >
        <MaterialIcons name="delete" size={Sizes.iconLg} color={C.onErrorContainer} />
      </Animated.View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[
            {
              backgroundColor: isUnread ? C.surfaceContainerLow : C.background,
              borderBottomWidth: Borders.thin,
              borderBottomColor: C.outlineVariant,
            },
            animStyle,
          ]}
        >
          <Pressable
            onPress={onPress}
            // A read row has nothing to press: plain text for TalkBack, not a button.
            accessibilityRole={onPress ? 'button' : 'text'}
            accessibilityLabel={spoken}
            accessibilityHint={isUnread ? 'Marque la notification comme lue' : undefined}
            accessibilityActions={onDelete ? [{ name: 'delete', label: 'Supprimer' }] : undefined}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'delete') onDelete?.(notification.id);
              else onPress?.();
            }}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: Spacing.ms,
                paddingHorizontal: Spacing.marginMobile,
                paddingVertical: Spacing.ms,
                minHeight: Sizes.touchTarget,
              },
              pressedStyle(pressed),
            ]}
          >
            <View
              style={{
                width: Sizes.avatarMd,
                height: Sizes.avatarMd,
                borderRadius: Radii.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: C[tone.bg],
              }}
            >
              <MaterialIcons name={tone.icon} size={Sizes.iconLg} color={C[tone.fg]} />
            </View>

            <View style={{ flex: 1, gap: Spacing.xxs }}>
              <AppText variant={isUnread ? 'bodyStrong' : 'body'}>
                {notification.title}
              </AppText>
              {notification.body ? (
                <AppText variant="bodySm" color="onSurfaceVariant" numberOfLines={3}>
                  {notification.body}
                </AppText>
              ) : null}
              <AppText variant="caption" color="onSurfaceVariant">
                {when}
              </AppText>
            </View>

            {isUnread ? (
              <View
                style={{
                  width: Sizes.dot,
                  height: Sizes.dot,
                  marginTop: Spacing.sm,
                  borderRadius: Radii.full,
                  backgroundColor: C.link,
                }}
              />
            ) : null}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
