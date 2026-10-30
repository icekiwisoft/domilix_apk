import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppText, Button, Screen, ScreenHeader, useToast } from '@/components/ui';
import { OtpInput } from '@/components/ui/otp-input';
import { Fonts, Spacing } from '@/constants/theme';
import { useResendVerificationCode, useVerifyPhone } from '@/hooks/queries/use-auth-queries';

const RESEND_SECONDS = 60;

function maskPhone(phone?: string) {
  if (!phone) return 'le numéro associé à votre compte';
  const digits = phone.replace(/^\+?237/, '').replace(/\D/g, '');
  if (digits.length < 9) return phone;
  const first = digits[0];
  const last2 = digits.slice(-2);
  return `+237 ${first}•• •• •• ${last2}`;
}

export default function VerifyPhoneScreen() {
  const toast = useToast();
  const router = useRouter();
  const { user_id, phone } = useLocalSearchParams<{ user_id: string; phone?: string }>();
  const verifyPhone = useVerifyPhone();
  const resendCode = useResendVerificationCode();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startCountdown();
    return () => clearInterval(intervalRef.current!);
  }, []);

  function startCountdown() {
    setSeconds(RESEND_SECONDS);
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function resend() {
    if (seconds > 0 || resendCode.isPending) return;
    resendCode.mutate(user_id, {
      onSuccess: () => {
        startCountdown();
        toast.show('Un nouveau code a été envoyé.', 'success');
      },
      onError: () => {
        toast.show("Impossible d'envoyer le code. Réessayez.", 'error');
      },
    });
  }

  function verify() {
    if (otp.length < 6) {
      setError(true);
      return;
    }
    setError(false);
    verifyPhone.mutate(
      { userId: user_id, code: otp },
      {
        onSuccess: () => router.replace('/(tabs)'),
        onError: () => setError(true),
      }
    );
  }

  return (
    <Screen background="surface" header={<ScreenHeader title="Vérifier votre numéro" />} contentStyle={{ gap: Spacing.xl }}>
      <AppText color="onSurfaceVariant">
        {'Un code à 6 chiffres a été envoyé au '}
        <AppText style={{ fontFamily: Fonts.semiBold }}>{maskPhone(phone)}</AppText>
      </AppText>

      <View style={{ gap: Spacing.sm }}>
        <OtpInput value={otp} onChange={setOtp} error={error} />
        {error ? (
          <AppText variant="caption" color="error" style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">
            Code incorrect. Veuillez réessayer.
          </AppText>
        ) : null}
      </View>

      <View style={{ alignItems: 'center' }}>
        {seconds > 0 ? (
          <AppText color="onSurfaceVariant">
            {'Renvoyer dans '}
            <AppText color="link" style={{ fontFamily: Fonts.semiBold }}>
              {seconds}s
            </AppText>
          </AppText>
        ) : (
          <Button variant="text" label="Renvoyer le code" onPress={resend} loading={resendCode.isPending} />
        )}
      </View>

      <Button
        label="Vérifier"
        size="lg"
        fullWidth
        onPress={verify}
        loading={verifyPhone.isPending}
        disabled={otp.length < 6}
      />
    </Screen>
  );
}
