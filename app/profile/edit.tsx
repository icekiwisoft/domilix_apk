import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { ProfileForm, type ProfileFormValues } from '@/components/forms/profile-form';
import { Avatar, ErrorState, LoadingState, OfflineState, Screen, ScreenHeader, useToast } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { useMe, useUpdateProfile } from '@/hooks/queries/use-auth-queries';
import { isNetworkError } from '@/lib/network-error';

export default function EditProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: user, isLoading, isError, error, refetch } = useMe();
  const { data: announcer } = useAnnouncer(user?.announcer ?? '');
  const updateProfile = useUpdateProfile();

  function handleSave(values: ProfileFormValues) {
    updateProfile.mutate(values, {
      onSuccess: () => router.back(),
      onError: (err) =>
        toast.show(
          isNetworkError(err)
            ? 'Pas de connexion internet. Vos modifications ne sont pas enregistrées.'
            : "Le profil n'a pas pu être mis à jour. Réessayez dans un instant.",
          'error',
        ),
    });
  }

  const header = <ScreenHeader title="Modifier le profil" onBack={() => router.back()} />;

  // The form reads its values once: wait for the account before showing it.
  if (isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Chargement du profil…" media={false} count={1} />
      </Screen>
    );
  }
  if (!user && isError) {
    return (
      <Screen header={header} contentStyle={{ flexGrow: 1 }}>
        {isNetworkError(error) ? (
          <OfflineState onRetry={() => refetch()} />
        ) : (
          <ErrorState title="Impossible de charger le profil" onRetry={() => refetch()} />
        )}
      </Screen>
    );
  }

  return (
    <Screen keyboard header={header} contentStyle={{ gap: Spacing.lg }}>
      {/* Read-only: the photo is managed for announcer accounts, from Profil annonceur. */}
      <View style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
        <Avatar size="lg" name={user?.name} uri={announcer?.avatar ?? undefined} />
      </View>

      <ProfileForm
        defaultValues={{
          name: user?.name,
          email: user?.email,
          phone_number: user?.phone_number,
        }}
        onSubmit={handleSave}
        loading={updateProfile.isPending}
      />
    </Screen>
  );
}
