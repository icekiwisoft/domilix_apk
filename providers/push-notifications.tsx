import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';

import { notificationLinkToAppPath } from '@/lib/deep-links';
import { registerForPushNotifications } from '@/lib/push-notifications';
import { useAuthStore } from '@/stores/auth.store';
import { useTourStore } from '@/stores/tour.store';

const ASKED_KEY = 'push-permission-asked';

/**
 * Push notifications of the signed-in account:
 * - the permission is asked once, in context: after the first-launch guide of
 *   the home screen, not over the sign-in screens (Settings can turn it on later);
 * - the token is sent again on every launch (it can change);
 * - a tap on a notification opens the screen of its link;
 * - a push received while the app is open refreshes the bell and the list.
 */
export function PushNotificationsObserver() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const toursHydrated = useTourStore((s) => s.hydrated);
  const homeTourDone = useTourStore((s) => s.seen.includes('home-v1'));
  const asked = useTourStore((s) => s.seen.includes(ASKED_KEY));
  const markSeen = useTourStore((s) => s.markSeen);
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!accessToken || !toursHydrated) return;
    const ask = homeTourDone && !asked;
    if (!ask && !asked) return; // Wait for the guide before the system dialog.
    if (ask) markSeen(ASKED_KEY);
    registerForPushNotifications(ask).catch(() => {
      // No network or no Play services: tried again on the next launch.
    });
  }, [accessToken, toursHydrated, homeTourDone, asked, markSeen]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => subscription.remove();
  }, [queryClient]);

  useEffect(() => {
    if (!lastResponse || lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const link = lastResponse.notification.request.content.data?.link;
    router.push(notificationLinkToAppPath(typeof link === 'string' ? link : null) as Href);
    void Notifications.clearLastNotificationResponseAsync();
  }, [lastResponse, router]);

  return null;
}
