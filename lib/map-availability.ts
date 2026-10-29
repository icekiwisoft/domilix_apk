import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Whether the native map can be shown. On Android, react-native-maps needs a
 * Google Maps API key in the app config (android.config.googleMaps.apiKey);
 * without it, mounting a MapView kills the app natively ("API key not
 * found"), out of reach of any error boundary. UI-07: the Carte view is only
 * offered when the key is configured.
 */
export function isMapAvailable(): boolean {
  if (Platform.OS !== 'android') return Platform.OS === 'ios';
  return !!Constants.expoConfig?.android?.config?.googleMaps?.apiKey;
}
