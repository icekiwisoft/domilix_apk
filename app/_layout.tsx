import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DomilixThemeProvider } from '@/providers/theme.provider';
import { QueryProvider } from '@/providers/query.provider';
import { AuthProvider } from '@/providers/auth.provider';
import { ToastProvider } from '@/components/ui/toast';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
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
      <QueryProvider>
        <DomilixThemeProvider>
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
              </Stack>
              <StatusBar style="auto" />
            </ToastProvider>
          </AuthProvider>
        </DomilixThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
