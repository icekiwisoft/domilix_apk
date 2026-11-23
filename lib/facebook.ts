import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Meta (Facebook) SDK: app installs and activations are logged automatically
// once the SDK starts; these helpers add the key conversions. Everything is a
// no-op when the build has no Facebook App ID (see app.config.js) or on web.
type FbsdkModule = typeof import('react-native-fbsdk-next');

const enabled = Platform.OS !== 'web' && Boolean(Constants.expoConfig?.extra?.facebookEnabled);
let sdk: FbsdkModule | null = null;

function getSdk() {
  if (!enabled) return null;
  if (!sdk) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sdk = require('react-native-fbsdk-next') as FbsdkModule;
    } catch {
      return null;
    }
  }
  return sdk;
}

export function initFacebook() {
  const fb = getSdk();
  if (!fb) return;
  try {
    fb.Settings.initializeSDK();
    fb.AppEventsLogger.flush();
  } catch {
    // Tracking must never block the app.
  }
}

export function logFacebookRegistration(method: 'email' | 'phone' | 'google') {
  const fb = getSdk();
  if (!fb) return;
  try {
    fb.AppEventsLogger.logEvent(fb.AppEventsLogger.AppEvents.CompletedRegistration, {
      [fb.AppEventsLogger.AppEventParams.RegistrationMethod]: method,
    });
  } catch { /* ignore */ }
}

export function logFacebookPurchase(amount: number | undefined, currency = 'XAF') {
  const fb = getSdk();
  if (!fb) return;
  try {
    if (amount && amount > 0) fb.AppEventsLogger.logPurchase(amount, currency, { content_type: 'domicoins' });
    else fb.AppEventsLogger.logEvent('DomicoinPurchase');
  } catch { /* ignore */ }
}

export function logFacebookUnlock(announceId: string) {
  const fb = getSdk();
  if (!fb) return;
  try {
    fb.AppEventsLogger.logEvent(fb.AppEventsLogger.AppEvents.UnlockedAchievement, {
      [fb.AppEventsLogger.AppEventParams.ContentID]: announceId,
    });
  } catch { /* ignore */ }
}
