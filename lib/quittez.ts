import { Linking } from 'react-native';

// Quittez le pays: the Domilix app that prepares studies and departures abroad
// (same account as Domilix). Its page on the website explains it and opens the
// Android test programme.
export const QUITTEZ_URL = 'https://domilix.com/fr/quittez';

export function openQuittez() {
  void Linking.openURL(QUITTEZ_URL);
}
