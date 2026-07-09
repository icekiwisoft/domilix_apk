import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { useResetPassword } from '@/hooks/queries/use-auth-queries';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators/auth.schema';

type Step = 'otp' | 'password' | 'success';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<Step>('otp');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const resetPassword = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  });

  function verifyOtp() {
    if (otp.length < 6) {
      setOtpError(true);
      return;
    }
    setOtpError(false);
    setStep('password');
  }

  function onSubmit(data: ResetPasswordFormValues) {
    resetPassword.mutate(
      {
        email: email ?? '',
        token: otp,
        code: otp,
        password: data.password,
        password_confirmation: data.confirmPassword,
      },
      {
        onSuccess: () => setStep('success'),
        onError: () => {
          setStep('otp');
          setOtpError(true);
        },
      }
    );
  }

  if (step === 'success') {
    return (
      <View style={[styles.successRoot, { backgroundColor: C.surface, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: C.surfaceContainer }]}>
            <MaterialIcons name="lock-open" size={40} color={C.primary} />
          </View>
          <Text style={[Typography.headlineMd, { color: C.onSurface, textAlign: 'center', marginTop: Spacing.xl }]}>
            Mot de passe modifié !
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm }]}>
            Votre mot de passe a été réinitialisé avec succès.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.submitBtn}
            contentStyle={styles.submitBtnContent}
          >
            Se connecter
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <IconButton
          icon="arrow-left"
          mode="outlined"
          size={22}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          style={styles.backBtn}
        />

        {step === 'otp' && (
          <>
            <View style={styles.header}>
              <Text style={[Typography.headlineLg, { color: C.primary }]}>Saisir le code</Text>
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs }]}>
                Entrez le code à 6 chiffres reçu par e-mail.
              </Text>
            </View>

            <View style={styles.otpSection}>
              <OtpInput value={otp} onChange={setOtp} error={otpError} />
              {otpError && (
                <Text style={[Typography.caption, { color: C.error, textAlign: 'center', marginTop: Spacing.sm }]}>
                  Code incorrect.
                </Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={verifyOtp}
              contentStyle={styles.submitBtnContent}
              style={styles.submitBtn}
            >
              Continuer
            </Button>
          </>
        )}

        {step === 'password' && (
          <>
            <View style={styles.header}>
              <Text style={[Typography.headlineLg, { color: C.primary }]}>Nouveau mot de passe</Text>
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs }]}>
                Choisissez un mot de passe sécurisé.
              </Text>
            </View>

            <View style={styles.form}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nouveau mot de passe"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPwd}
                    error={errors.password?.message}
                    rightElement={
                      <Pressable
                        onPress={() => setShowPwd((v) => !v)}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        <MaterialIcons
                          name={showPwd ? 'visibility' : 'visibility-off'}
                          size={22}
                          color={C.onSurfaceVariant}
                        />
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
                    label="Confirmer le mot de passe"
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
                        <MaterialIcons
                          name={showConfirm ? 'visibility' : 'visibility-off'}
                          size={22}
                          color={C.onSurfaceVariant}
                        />
                      </Pressable>
                    }
                  />
                )}
              />

              {resetPassword.error && (
                <View style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}>
                  <MaterialIcons name="error-outline" size={16} color={C.error} />
                  <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
                    Impossible de réinitialiser le mot de passe. Le code a peut-être expiré.
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={resetPassword.isPending}
                disabled={resetPassword.isPending}
                contentStyle={styles.submitBtnContent}
                style={styles.submitBtn}
              >
                Réinitialiser
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  successRoot: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginMobile,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.marginMobile,
  },
  backBtn: {
    alignSelf: 'flex-start',
    margin: 0,
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
  },
  otpSection: {
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  submitBtn: {
    borderRadius: Radius.md,
  },
  submitBtnContent: {
    height: 50,
  },
});
