import { Stack, useRouter } from 'expo-router';

import { CREATE_TITLE } from '@/components/forms/step-layout';
import { EmptyState, LoadingState, LoginGate, Screen, ScreenHeader } from '@/components/ui';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { isAnnouncerToken } from '@/lib/decode-token';
import { useAuthStore } from '@/stores/auth.store';

/**
 * POST /announces needs a signed-in announcer (backend AuthGuard, then
 * ensureAnnouncerUser): like the website's Publish page, the flow checks it
 * before the form instead of failing at the last step.
 */
export default function CreateListingLayout() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading } = useMe();
  const isAnnouncer = isAnnouncerToken(accessToken) || !!user?.is_announcer || !!user?.announcer;
  const header = <ScreenHeader title={CREATE_TITLE} onBack={() => router.back()} backLabel="Fermer" />;

  if (!accessToken) {
    return (
      <Screen header={header}>
        <LoginGate
          title="Connectez-vous pour publier"
          subtitle="Un compte annonceur est nécessaire pour publier une annonce sur Domilix."
          redirect="/announces/create/step-1"
        />
      </Screen>
    );
  }

  if (!isAnnouncer && isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Vérification de votre compte…" media={false} count={1} />
      </Screen>
    );
  }

  if (!isAnnouncer) {
    // Website copy: messages/fr.json announcerRequired.
    return (
      <Screen header={header} contentStyle={{ flexGrow: 1 }}>
        <EmptyState
          icon="add-business"
          title="Activez votre profil annonceur"
          description="Activez votre profil annonceur pour publier une annonce immobilière ou mobilier sur Domilix."
          actionLabel="Activer mon profil"
          onAction={() => router.replace('/profile/become-announcer')}
        />
      </Screen>
    );
  }

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
