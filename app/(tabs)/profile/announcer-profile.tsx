import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncerForm, type AnnouncerFormValues } from '@/components/forms/announcer-form';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe, useUpdateAnnouncerProfile } from '@/hooks/queries/use-auth-queries';
import { useAnnouncer } from '@/hooks/queries/use-announcers';

export default function AnnouncerProfileEditScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { data: user } = useMe();
  const announcerId = user?.announcer ?? '';
  const { data: announcer } = useAnnouncer(announcerId);
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
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>
          Profil annonceur
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: C.primaryContainer + '33', borderColor: C.primaryContainer }]}>
          <MaterialIcons name="info-outline" size={18} color={C.primary} />
          <Text style={[Typography.caption, { color: C.primary, flex: 1, lineHeight: 18 }]}>
            Ces informations sont visibles sur votre profil public et vos annonces.
          </Text>
        </View>

        {/* Avatar picker */}
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickAvatar} style={styles.avatarPressable}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={[styles.avatar, { borderColor: C.primary + '40' }]} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
                <MaterialIcons name="storefront" size={44} color={C.onSurfaceVariant} />
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: C.primary }]}>
              <MaterialIcons name="photo-camera" size={16} color={C.onPrimary} />
            </View>
          </Pressable>
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: Spacing.sm }]}>
            Logo ou photo de profil
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formWrapper}>
          <AnnouncerForm
            // Remount once the announcer record has loaded so react-hook-form
            // picks up the fetched values (its defaultValues are only read once).
            key={announcer?.id ?? 'loading'}
            defaultValues={{
              company_name: announcer?.company_name,
              bio: announcer?.bio ?? undefined,
              professional_phone: announcer?.professional_phone,
            }}
            onSubmit={handleSave}
            loading={updateAnnouncerProfile.isPending}
          />
        </View>

        {/* View public profile link */}
        {!!announcerId && (
          <Pressable
            onPress={() => router.push(`/announcers/${announcerId}`)}
            style={styles.viewPublicRow}
          >
            <MaterialIcons name="open-in-new" size={16} color={C.primary} />
            <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Voir mon profil public
            </Text>
          </Pressable>
        )}
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
  scroll: {
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginHorizontal: Spacing.marginMobile,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  avatarPressable: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrapper: {
    paddingHorizontal: Spacing.marginMobile,
  },
  viewPublicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
});
