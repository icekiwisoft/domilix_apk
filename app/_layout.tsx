import {
  MonaSans_400Regular,
  MonaSans_500Medium,
  MonaSans_600SemiBold,
  MonaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/mona-sans';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PaperDarkTheme, PaperLightTheme } from '@/constants/paper-theme';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DomilixThemeProvider } from '@/providers/theme.provider';
import { QueryProvider } from '@/providers/query.provider';
import { AuthProvider } from '@/providers/auth.provider';
import { useAuthStore } from '@/stores/auth.store';
import { ToastProvider } from '@/components/ui/toast';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Keys must match the family names in constants/theme.ts (Fonts).
  const [fontsLoaded] = useFonts({
    [Fonts.regular]: MonaSans_400Regular,
    [Fonts.medium]: MonaSans_500Medium,
    [Fonts.semiBold]: MonaSans_600SemiBold,
    [Fonts.bold]: MonaSans_700Bold,
  });

  // Keep the splash until the stored session has been read (AuthProvider), so
  // a signed-in user never sees the login screen flash at startup.
  const authHydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (fontsLoaded && authHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, authHydrated]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <QueryProvider>
        <DomilixThemeProvider>
          <PaperProvider
            theme={colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme}
            settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}
          >
            <AuthProvider>
              <ToastProvider>
                <Stack>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen name="announces/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="announcers/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="(modals)/filter-sheet" options={{ presentation: 'modal', headerShown: false }} />
                  <Stack.Screen name="(modals)/unlock-confirm" options={{ presentation: 'transparentModal', headerShown: false }} />
                  <Stack.Screen name="announces/create" options={{ headerShown: false }} />
                  <Stack.Screen name="announces/edit" options={{ headerShown: false }} />
                  <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
                  <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
                  <Stack.Screen name="profile/my-listings" options={{ headerShown: false }} />
                  <Stack.Screen name="profile/subscriptions" options={{ headerShown: false }} />
                  <Stack.Screen name="profile/announcer-profile" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </ToastProvider>
            </AuthProvider>
          </PaperProvider>
        </DomilixThemeProvider>
      </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
