import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OtpInput } from '@/components/ui/otp-input';
import { useToast } from '@/components/ui/toast';
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
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();
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
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
      ]}
      style={{ backgroundColor: C.surface }}
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

      {/* Headline */}
      <View style={styles.header}>
        <Text style={[Typography.headlineLg, { color: C.primary }]}>Vérifier votre numéro</Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.sm }]}>
          {'Un code à 6 chiffres a été envoyé au '}
          <Text style={{ color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            {maskPhone(phone)}
          </Text>
        </Text>
      </View>

      {/* OTP input */}
      <View style={styles.otpSection}>
        <OtpInput value={otp} onChange={setOtp} error={error} />
        {error && (
          <Text style={[Typography.caption, { color: C.error, textAlign: 'center', marginTop: Spacing.sm }]}>
            Code incorrect. Veuillez réessayer.
          </Text>
        )}
      </View>

      {/* Resend */}
      <View style={styles.resendRow}>
        {seconds > 0 ? (
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
            {'Renvoyer dans '}
            <Text style={{ color: C.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              {seconds}s
            </Text>
          </Text>
        ) : (
          <Button mode="text" onPress={resend} loading={resendCode.isPending} disabled={resendCode.isPending}>
            Renvoyer le code
          </Button>
        )}
      </View>

      {/* Verify CTA */}
      <Button
        mode="contained"
        onPress={verify}
        loading={verifyPhone.isPending}
        disabled={verifyPhone.isPending || otp.length < 6}
        contentStyle={styles.submitBtnContent}
        style={styles.submitBtn}
      >
        Vérifier
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: Spacing.xxl,
  },
  otpSection: {
    marginBottom: Spacing.xl,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  submitBtn: {
    borderRadius: Radius.md,
  },
  submitBtnContent: {
    height: 50,
  },
});
