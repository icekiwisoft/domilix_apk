import { useRouter } from 'expo-router';
import { Component, Suspense, lazy, type ReactNode } from 'react';
import { View } from 'react-native';

import { EmptyState, LoadingState, Screen } from '@/components/ui';

// Lazy import keeps react-native-maps out of the module evaluation path.
// Expo Router discovers this route without touching the native module.
const MapScreenContent = lazy(() => import('@/components/maps/map-screen-content'));

class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
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
  const router = useRouter();
  return (
    <Screen bottomInset={false}>
      <EmptyState
        icon="map"
        title="Vue carte indisponible"
        description="La carte ne peut pas s’afficher sur cet appareil. Les annonces restent disponibles en liste."
        actionLabel="Afficher la liste"
        onAction={() => router.back()}
      />
    </Screen>
  );
}

function MapLoadingFallback() {
  return (
    <Screen scroll={false} bottomInset={false}>
      <LoadingState label="Chargement de la carte…" count={2} media={false} />
    </Screen>
  );
}

export default function MapScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MapErrorBoundary>
        <Suspense fallback={<MapLoadingFallback />}>
          <MapScreenContent />
        </Suspense>
      </MapErrorBoundary>
    </View>
  );
}
