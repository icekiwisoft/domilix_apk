import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_SEEN: '@domilix/onboarding_seen',
} as const;

export const AppStorage = {
  hasSeenOnboarding: () => AsyncStorage.getItem(KEYS.ONBOARDING_SEEN),
  markOnboardingSeen: () => AsyncStorage.setItem(KEYS.ONBOARDING_SEEN, '1'),
};
