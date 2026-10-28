import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useChangePassword,
  useDeleteAccount,
  useMe,
  useSendEmailVerification,
  useVerifyEmail,
} from '@/hooks/queries/use-auth-queries';
import { getApiErrorMessage } from '@/lib/api-error';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/auth.schema';
import { useThemeStore, type ThemePreference } from '@/stores/theme.store';

function SectionLabel({ children }: { children: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.12, marginBottom: Spacing.sm }]}>
      {children}
    </Text>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();
  const { preference, setPreference } = useThemeStore();
  const changePassword = useChangePassword();
  const { data: me } = useMe();
  const sendEmailVerification = useSendEmailVerification();
  const verifyEmail = useVerifyEmail();
  const deleteAccount = useDeleteAccount();
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const needsEmailVerification = !!me?.email && me.email_verified === false;
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const segmentedTheme = { colors: { secondaryContainer: C.primary, onSecondaryContainer: C.onPrimary } };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  function onSubmit(data: ChangePasswordFormValues) {
    changePassword.mutate(
      {
        old_password: data.oldPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.show('Mot de passe mis à jour.', 'success');
          reset();
        },
        onError: () => {
          toast.show('Mot de passe actuel incorrect ou erreur serveur.', 'error');
        },
      }
    );
  }

  function handleSendEmailCode() {
    sendEmailVerification.mutate(undefined, {
      onSuccess: () => {
        setEmailCodeSent(true);
        toast.show('Code envoyé. Consultez votre boîte email.', 'success');
      },
      onError: (err) => toast.show(getApiErrorMessage(err, "Impossible d'envoyer le code."), 'error'),
    });
  }

  function handleVerifyEmail() {
    verifyEmail.mutate(emailCode, {
      onSuccess: () => {
        setEmailCode('');
        setEmailCodeSent(false);
        toast.show('Email vérifié avec succès.', 'success');
      },
      onError: (err) => toast.show(getApiErrorMessage(err, 'Code de vérification incorrect.'), 'error'),
    });
  }

  function handleDeleteAccount() {
    deleteAccount.mutate(deletePassword, {
      onSuccess: () => {
        setDeleteVisible(false);
        router.replace('/(auth)');
      },
      onError: (err) => toast.show(getApiErrorMessage(err, 'Mot de passe incorrect ou erreur serveur.'), 'error'),
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <IconButton
          icon="arrow-left"
          size={22}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
        />
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Paramètres
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Apparence */}
          <View style={styles.section}>
            <SectionLabel>Apparence</SectionLabel>
            <SegmentedButtons
              value={preference}
              onValueChange={(v) => setPreference(v as ThemePreference)}
              theme={segmentedTheme}
              buttons={[
                { value: 'light', label: 'Clair', icon: 'white-balance-sunny' },
                { value: 'dark', label: 'Sombre', icon: 'weather-night' },
                { value: 'system', label: 'Système', icon: 'theme-light-dark' },
              ]}
            />
          </View>

          {/* Vérification de l'email */}
          {needsEmailVerification && (
            <View style={styles.section}>
              <SectionLabel>Vérification de l&apos;email</SectionLabel>
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 22 }]}>
                Votre adresse {me?.email} n&apos;est pas encore vérifiée. Un code à 6 chiffres vous sera envoyé.
              </Text>
              {emailCodeSent && (
                <View style={{ gap: Spacing.md }}>
                  <OtpInput value={emailCode} onChange={setEmailCode} />
                  <Button
                    mode="contained"
                    onPress={handleVerifyEmail}
                    loading={verifyEmail.isPending}
                    disabled={verifyEmail.isPending || emailCode.length < 6}
                  >
                    Vérifier
                  </Button>
                </View>
              )}
              <Button
                mode={emailCodeSent ? 'text' : 'contained'}
                onPress={handleSendEmailCode}
                loading={sendEmailVerification.isPending}
                disabled={sendEmailVerification.isPending}
              >
                {emailCodeSent ? 'Renvoyer le code' : 'Envoyer le code'}
              </Button>
            </View>
          )}

          {/* Sécurité */}
          <View style={styles.section}>
            <SectionLabel>Changer le mot de passe</SectionLabel>
            <View style={styles.form}>
              <Controller
                control={control}
                name="oldPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Mot de passe actuel"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showOld}
                    error={errors.oldPassword?.message}
                    rightElement={
                      <Pressable
                        onPress={() => setShowOld((v) => !v)}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel={showOld ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        <MaterialIcons name={showOld ? 'visibility' : 'visibility-off'} size={22} color={C.onSurfaceVariant} />
                      </Pressable>
                    }
                  />
                )}
              />

              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nouveau mot de passe"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showNew}
                    error={errors.newPassword?.message}
                    rightElement={
                      <Pressable
                        onPress={() => setShowNew((v) => !v)}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel={showNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        <MaterialIcons name={showNew ? 'visibility' : 'visibility-off'} size={22} color={C.onSurfaceVariant} />
                      </Pressable>
                    }
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirmer le nouveau mot de passe"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirm}
                    error={errors.confirmPassword?.message}
                    rightElement={
                      <Pressable
                        onPress={() => setShowConfirm((v) => !v)}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        <MaterialIcons name={showConfirm ? 'visibility' : 'visibility-off'} size={22} color={C.onSurfaceVariant} />
                      </Pressable>
                    }
                  />
                )}
              />

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={changePassword.isPending}
                disabled={changePassword.isPending}
                contentStyle={styles.submitBtnContent}
                style={styles.submitBtn}
              >
                Mettre à jour le mot de passe
              </Button>
            </View>
          </View>

          {/* Suppression du compte */}
          <View style={styles.section}>
            <SectionLabel>Supprimer mon compte</SectionLabel>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 22 }]}>
              Cette action désactive votre compte Domilix. Vous serez déconnecté immédiatement et ne pourrez plus
              accéder à votre espace.
            </Text>
            <Button
              mode="outlined"
              textColor={C.error}
              style={{ borderColor: C.error }}
              onPress={() => {
                setDeletePassword('');
                setDeleteVisible(true);
              }}
            >
              Supprimer mon compte
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Confirmer la suppression</Dialog.Title>
          <Dialog.Content style={{ gap: Spacing.md }}>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              Saisissez votre mot de passe pour supprimer votre compte Domilix. Cette action est irréversible.
            </Text>
            <Input
              label="Votre mot de passe"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={() => setDeleteVisible(false)}>Annuler</Button>
            <Button
              mode="text"
              textColor={C.error}
              onPress={handleDeleteAccount}
              loading={deleteAccount.isPending}
              disabled={deleteAccount.isPending || !deletePassword}
            >
              Supprimer définitivement
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  form: {
    gap: Spacing.lg,
  },
  submitBtn: {
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  submitBtnContent: {
    height: 50,
  },
});
