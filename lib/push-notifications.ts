import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NotificationsService } from '@/services/notifications.service';

// Shown while the app is open too (the in-app list refreshes on its own).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let registeredToken: string | null = null;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  // The backend sends every push on the "default" channel.
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications Domilix',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: '#e8921a',
  });
}

export async function getPushPermission() {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return { granted: status === 'granted', canAskAgain };
}

/**
 * Asks for the permission when `ask` is true (never in a loop: Android only
 * shows the dialog while it may still ask), then sends the Expo push token of
 * this phone to the API. Returns whether pushes can be received.
 */
export async function registerForPushNotifications(ask: boolean) {
  if (Platform.OS === 'web' || !Device.isDevice) return false;
  await ensureAndroidChannel();
  let { granted, canAskAgain } = await getPushPermission();
  if (!granted && ask && canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).status === 'granted';
  }
  if (!granted) return false;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  if (token !== registeredToken) {
    await NotificationsService.registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
    registeredToken = token;
  }
  return true;
}

/** On sign-out: this phone stops receiving the account's notifications. */
export async function unregisterPushNotifications() {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  try {
    await NotificationsService.removePushToken(token);
  } catch {
    // Best effort: the backend drops dead tokens when Expo reports them.
  }
}
