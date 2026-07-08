import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { ProfileForm, type ProfileFormValues } from '@/components/forms/profile-form';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe, useUpdateProfile } from '@/hooks/queries/use-auth-queries';

export default function EditProfileScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { data: user } = useMe();
  const updateProfile = useUpdateProfile();
  const [avatar, setAvatar] = useState<string | undefined>(user?.announcer?.avatar);

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

  function handleSave(values: ProfileFormValues) {
    updateProfile.mutate(values, {
      onSuccess: () => router.back(),
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <IconButton
          icon="arrow-left"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          iconColor={C.onSurface}
          style={styles.backBtn}
        />
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>
          Modifier le profil
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar picker */}
        <View style={styles.avatarSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Changer la photo de profil"
            onPress={handlePickAvatar}
            style={styles.avatarPressable}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={[styles.avatar, { borderColor: C.primary + '40' }]} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
                <MaterialIcons name="person" size={44} color={C.onSurfaceVariant} />
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: C.primary }]}>
              <MaterialIcons name="photo-camera" size={16} color={C.onPrimary} />
            </View>
          </Pressable>
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: Spacing.sm }]}>
            Appuyez pour changer la photo
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formWrapper}>
          <ProfileForm
            defaultValues={{
              name: user?.name,
              email: user?.email,
              phone_number: user?.phone_number,
            }}
            onSubmit={handleSave}
            loading={updateProfile.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { margin: 0 },
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarPressable: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrapper: {
    paddingHorizontal: Spacing.marginMobile,
  },
});
