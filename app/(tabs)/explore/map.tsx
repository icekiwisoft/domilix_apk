import { Component, Suspense, lazy } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MapListToggle } from '@/components/search/map-list-toggle';

// Lazy import keeps react-native-maps out of the module evaluation path.
// Expo Router discovers this route without touching the native module.
const MapScreenContent = lazy(() => import('@/components/maps/map-screen-content'));

class MapErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <MapUnavailableFallback />;
    return this.props.children;
  }
}

function MapUnavailableFallback() {
  const C = Colors['light'];
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: C.surfaceContainer }]}>
          <MaterialIcons name="map" size={40} color={C.onSurfaceVariant} />
        </View>
        <Text style={[Typography.headlineMd, { color: C.onSurface, textAlign: 'center', marginTop: Spacing.lg }]}>
          Vue carte indisponible
        </Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 }]}>
          La carte native nécessite un build de développement.{'\n'}
          Lancez <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', color: C.primary }}>expo run:android</Text> pour l'activer.
        </Text>
      </View>
      <View style={styles.fab}>
        <MapListToggle mode="map" onToggle={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

function MapLoadingFallback() {
  const C = Colors['light'];
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    </SafeAreaView>
  );
}

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <MapErrorBoundary>
        <Suspense fallback={<MapLoadingFallback />}>
          <MapScreenContent />
        </Suspense>
      </MapErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginMobile,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
