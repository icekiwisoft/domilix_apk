import { Stack } from 'expo-router';

export default function CreateListingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        // Screens revisited via "Retour" were being frozen while blurred
        // (react-native-screens perf optimization) and had to "thaw" before
        // repainting — that thaw is what read as a reload flash on back nav.
        freezeOnBlur: false,
      }}
    />
  );
}
