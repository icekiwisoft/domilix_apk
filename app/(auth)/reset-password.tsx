import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators/auth.schema';

type Step = 'otp' | 'password' | 'success';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const [step, setStep] = useState<Step>('otp');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  });

  async function verifyOtp() {
    if (otp.length < 6) {
      setOtpError(true);
      return;
    }
    setOtpError(false);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    setStep('password');
  }

  async function onSubmit(_data: ResetPasswordFormValues) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    setStep('success');
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
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            style={[styles.submitBtn, { backgroundColor: C.primary, marginTop: Spacing.xxl }]}
          >
            <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
              Se connecter
            </Text>
          </Pressable>
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
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: C.outlineVariant }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={C.onSurfaceVariant} />
        </Pressable>

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

            <Pressable
              onPress={verifyOtp}
              disabled={loading}
              style={[styles.submitBtn, { backgroundColor: C.primary, opacity: loading ? 0.7 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color={C.onPrimary} />
              ) : (
                <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
                  Continuer
                </Text>
              )}
            </Pressable>
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
                      <Pressable onPress={() => setShowPwd((v) => !v)} hitSlop={8}>
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
                      <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
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

              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                style={[styles.submitBtn, { backgroundColor: C.primary, opacity: loading ? 0.7 : 1 }]}
              >
                {loading ? (
                  <ActivityIndicator color={C.onPrimary} />
                ) : (
                  <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
                    Réinitialiser
                  </Text>
                )}
              </Pressable>
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
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
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
  submitBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: '#633f00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
});
