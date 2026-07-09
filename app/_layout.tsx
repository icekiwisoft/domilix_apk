import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DomilixThemeProvider } from '@/providers/theme.provider';
import { QueryProvider } from '@/providers/query.provider';
import { AuthProvider } from '@/providers/auth.provider';
import { ToastProvider } from '@/components/ui/toast';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

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
                  <Stack.Screen name="profile/publish" options={{ headerShown: false }} />
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
