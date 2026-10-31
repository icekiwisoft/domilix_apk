import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AnnouncerForm, type AnnouncerFormValues } from '@/components/forms/announcer-form';
import {
  AppText,
  Avatar,
  Banner,
  ErrorState,
  LoadingState,
  OfflineState,
  pressedStyle,
  Screen,
  ScreenHeader,
  useToast,
} from '@/components/ui';
import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { useMe, useUpdateAnnouncerProfile } from '@/hooks/queries/use-auth-queries';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isNetworkError } from '@/lib/network-error';

export default function AnnouncerProfileEditScreen() {
  const router = useRouter();
  const toast = useToast();
  const C = useThemeColors();
  const me = useMe();
  const user = me.data;
  const announcerId = user?.announcer ?? '';
  const announcerQuery = useAnnouncer(announcerId);
  const announcer = announcerQuery.data;
  const updateAnnouncerProfile = useUpdateAnnouncerProfile();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (announcer?.avatar) setAvatar(announcer.avatar);
  }, [announcer?.avatar]);

  async function handlePickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  }

  function handleSave(values: AnnouncerFormValues) {
    const formData = new FormData();
    if (values.company_name) formData.append('company_name', values.company_name);
    if (values.bio) formData.append('bio', values.bio);
    if (values.professional_phone) formData.append('professional_phone', values.professional_phone);
    if (avatar && avatar !== announcer?.avatar) {
      const filename = avatar.split('/').pop() ?? 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('avatar', { uri: avatar, name: filename, type } as unknown as Blob);
    }
    updateAnnouncerProfile.mutate(formData, {
      onSuccess: () => router.back(),
      onError: (err) =>
        toast.show(
          isNetworkError(err)
            ? 'Pas de connexion internet. Vos modifications ne sont pas enregistrées.'
            : "Le profil annonceur n'a pas pu être mis à jour. Réessayez dans un instant.",
          'error',
        ),
    });
  }

  const header = <ScreenHeader title="Profil annonceur" onBack={() => router.back()} />;

  if (me.isLoading || announcerQuery.isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Chargement du profil annonceur…" media={false} count={2} />
      </Screen>
    );
  }
  const failed = (!user && me.isError) || (!announcer && announcerQuery.isError);
  if (failed) {
    const error = me.error ?? announcerQuery.error;
    const retry = () => (me.isError ? me.refetch() : announcerQuery.refetch());
    return (
      <Screen header={header} contentStyle={{ flexGrow: 1 }}>
        {isNetworkError(error) ? (
          <OfflineState onRetry={retry} />
        ) : (
          <ErrorState title="Impossible de charger le profil annonceur" onRetry={retry} />
        )}
      </Screen>
    );
  }

  return (
    <Screen keyboard header={header} contentStyle={{ gap: Spacing.lg }}>
      <Banner>Ces informations sont visibles sur votre profil public et vos annonces.</Banner>

      <View style={{ alignItems: 'center', gap: Spacing.sm }}>
        <Pressable
          onPress={handlePickAvatar}
          accessibilityRole="button"
          accessibilityLabel="Changer le logo ou la photo de profil"
          style={({ pressed }) => [{ padding: Spacing.xs, borderRadius: Radii.full }, pressedStyle(pressed)]}
        >
          <Avatar size="lg" name={announcer?.name} uri={avatar} fallbackIcon="storefront" />
          <View
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: Sizes.iconLg + Spacing.xs,
              height: Sizes.iconLg + Spacing.xs,
              borderRadius: Radii.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.cta,
            }}
          >
            <MaterialIcons name="photo-camera" size={Sizes.iconSm} color={C.onCta} />
          </View>
        </Pressable>
        <AppText variant="caption" color="onSurfaceVariant" importantForAccessibility="no">
          Logo ou photo de profil
        </AppText>
      </View>

      <AnnouncerForm
        // Remount once the announcer record has loaded so react-hook-form
        // picks up the fetched values (its defaultValues are only read once).
        key={announcer?.id ?? 'loading'}
        defaultValues={{
          // GET /announcers/:id returns the saved company_name as `name` and
          // professional_phone as `contact` (backend AuthService.updateAnnouncerProfile).
          company_name: announcer?.name,
          bio: announcer?.bio ?? undefined,
          professional_phone: announcer?.contact,
        }}
        onSubmit={handleSave}
        loading={updateAnnouncerProfile.isPending}
      />
    </Screen>
  );
}
