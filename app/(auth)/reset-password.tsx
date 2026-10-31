import { useState } from 'react';
import { View } from 'react-native';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppText,
  Banner,
  Button,
  EmptyState,
  Field,
  KeyboardTarget,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { OtpInput } from '@/components/ui/otp-input';
import { Spacing } from '@/constants/theme';
import { useResetPassword } from '@/hooks/queries/use-auth-queries';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators/auth.schema';

type Step = 'otp' | 'password' | 'success';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<Step>('otp');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const resetPassword = useResetPassword();

  const {
    control,
    handleSubmit,
    setValue,
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
    // The schema validates the code with the passwords (QA-22: it stayed '' in
    // the form, so zod refused every submit without showing anything).
    setValue('otp', otp);
    setStep('password');
  }

  // A code refused by the schema is not on the password step: go back to the
  // code step and show it there instead of blocking silently.
  function onInvalid(invalid: FieldErrors<ResetPasswordFormValues>) {
    if (invalid.otp) {
      setStep('otp');
      setOtpError(true);
    }
  }

  function onSubmit(data: ResetPasswordFormValues) {
    resetPassword.mutate(
      {
        email: email ?? '',
        token: data.otp,
        code: data.otp,
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
      <Screen background="surface">
        <EmptyState
          icon="lock-open"
          title="Mot de passe modifié !"
          description="Votre mot de passe a été réinitialisé avec succès."
          actionLabel="Se connecter"
          onAction={() => router.replace('/(auth)/login')}
        />
      </Screen>
    );
  }

  const title = step === 'otp' ? 'Saisir le code' : 'Nouveau mot de passe';

  return (
    <Screen keyboard background="surface" header={<ScreenHeader title={title} />}>
      {step === 'otp' && (
        <>
          <AppText color="onSurfaceVariant">Entrez le code à 6 chiffres reçu par e-mail.</AppText>

          <View style={{ gap: Spacing.sm, marginVertical: Spacing.md }}>
            <OtpInput value={otp} onChange={setOtp} error={otpError} />
            {otpError ? (
              <AppText variant="caption" color="error" style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">
                Code incorrect.
              </AppText>
            ) : null}
          </View>

          <Button label="Continuer" size="lg" fullWidth onPress={verifyOtp} />
        </>
      )}

      {step === 'password' && (
        <>
          <AppText color="onSurfaceVariant">Choisissez un mot de passe sécurisé.</AppText>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Nouveau mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secure
                autoComplete="new-password"
                textContentType="newPassword"
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Confirmer le mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secure
                autoComplete="new-password"
                textContentType="newPassword"
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {resetPassword.error ? (
            <Banner tone="error">Impossible de réinitialiser le mot de passe. Le code a peut-être expiré.</Banner>
          ) : null}

          <KeyboardTarget>
            <Button
              label="Réinitialiser"
              size="lg"
              fullWidth
              onPress={handleSubmit(onSubmit, onInvalid)}
              loading={resetPassword.isPending}
              style={{ marginTop: Spacing.xs }}
            />
          </KeyboardTarget>
        </>
      )}
    </Screen>
  );
}
