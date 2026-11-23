import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileForm, type ProfileFormValues } from '@/components/forms/profile-form';
import { AppText, Avatar, ErrorState, LoadingState, OfflineState, Screen, ScreenHeader, useToast } from '@/components/ui';
import { pressedStyle } from '@/components/ui/pressed';
import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useMe, useUpdateProfile } from '@/hooks/queries/use-auth-queries';
import { useThemeColors } from '@/hooks/use-theme-color';
import { getApiErrorMessage } from '@/lib/api-error';
import { isNetworkError } from '@/lib/network-error';
import { UploadsService, type PickedFile } from '@/services/uploads.service';
import type { UpdateProfileDto } from '@/types/auth';

type ImageKind = 'avatar' | 'presentation';
const COVER_HEIGHT = 150;

function pickedFile(asset: ImagePicker.ImagePickerAsset, fallbackName: string): PickedFile {
  const name = asset.fileName ?? asset.uri.split('/').pop() ?? fallbackName;
  return { uri: asset.uri, name, mimeType: asset.mimeType ?? 'image/jpeg' };
}

export default function EditProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: user, isLoading, isError, error, refetch } = useMe();
  const C = useThemeColors();
  const updateProfile = useUpdateProfile();
  const [avatar, setAvatar] = useState<PickedFile | null>(null);
  const [presentation, setPresentation] = useState<PickedFile | null>(null);
  const [uploading, setUploading] = useState(false);

  // The profile photo and presentation image belong to the user account; the
  // announcer page shows the same images.
  async function pickImage(kind: ImageKind) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: kind === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.85,
    });
    if (result.canceled) return;
    const file = pickedFile(result.assets[0], `${kind}.jpg`);
    if (kind === 'avatar') setAvatar(file);
    else setPresentation(file);
  }

  async function handleSave(values: ProfileFormValues) {
    const dto: UpdateProfileDto = { name: values.name };
    if (values.email) dto.email = values.email;
    if (values.phone_number) dto.phone_number = values.phone_number;
    try {
      setUploading(Boolean(avatar || presentation));
      if (avatar) dto.avatar_media_id = (await UploadsService.upload('avatar', avatar)).id;
      if (presentation) {
        dto.presentation_media_id = (await UploadsService.upload('presentation-image', presentation)).id;
      }
    } catch (err) {
      toast.show(getApiErrorMessage(err, "L'image n'a pas pu être envoyée. Réessayez dans un instant."), 'error');
      return;
    } finally {
      setUploading(false);
    }
    updateProfile.mutate(dto, {
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

  const avatarUri = avatar?.uri ?? user?.avatar ?? undefined;
  const presentationUri = presentation?.uri ?? user?.presentation ?? undefined;
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
      <View>
        <Pressable
          onPress={() => pickImage('presentation')}
          accessibilityRole="button"
          accessibilityLabel="Changer l'image de présentation"
          style={({ pressed }) => [
            styles.cover,
            { backgroundColor: C.surfaceContainerHigh, borderColor: C.outlineVariant },
            pressedStyle(pressed),
          ]}
        >
          {presentationUri ? (
            <Image source={{ uri: presentationUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.coverEmpty}>
              <MaterialIcons name="add-photo-alternate" size={Sizes.iconLg} color={C.onSurfaceVariant} />
              <AppText variant="label" color="onSurfaceVariant">Image de présentation</AppText>
            </View>
          )}
        </Pressable>
        <Pressable
          onPress={() => pickImage('avatar')}
          accessibilityRole="button"
          accessibilityLabel="Changer la photo de profil"
          hitSlop={Spacing.sm}
          style={({ pressed }) => [styles.avatar, pressedStyle(pressed)]}
        >
          <Avatar size="lg" name={user?.name} uri={avatarUri} />
          <View style={[styles.camera, { backgroundColor: C.primaryContainer, borderColor: C.background }]}>
            <MaterialIcons name="photo-camera" size={Sizes.iconSm} color={C.onPrimaryContainer} />
          </View>
        </Pressable>
        <AppText variant="caption" color="onSurfaceVariant" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
          {uploading ? 'Envoi des images…' : 'Ces images apparaissent aussi sur votre page annonceur.'}
        </AppText>
      </View>

      <ProfileForm
        defaultValues={{
          name: user?.name,
          email: user?.email,
          phone_number: user?.phone_number,
        }}
        onSubmit={handleSave}
        loading={uploading || updateProfile.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: COVER_HEIGHT,
    borderRadius: Radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  avatar: { alignSelf: 'center', marginTop: -Sizes.avatarLg / 2 },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: Sizes.iconLg + Spacing.sm,
    height: Sizes.iconLg + Spacing.sm,
    borderRadius: Radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
