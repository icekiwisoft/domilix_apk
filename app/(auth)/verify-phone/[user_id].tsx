import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OtpInput } from '@/components/ui/otp-input';

const RESEND_SECONDS = 60;

export default function VerifyPhoneScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { user_id } = useLocalSearchParams<{ user_id: string }>();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (seconds > 0) return;
    startCountdown();
    // mock resend
  }

  async function verify() {
    if (otp.length < 6) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    // On success → go to tabs
    router.replace('/(tabs)');
  }

  const maskedPhone = '+237 6•• •• •• ••';

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
      <Pressable
        onPress={() => router.back()}
        style={[styles.backBtn, { borderColor: C.outlineVariant }]}
      >
        <MaterialIcons name="arrow-back" size={24} color={C.onSurfaceVariant} />
      </Pressable>

      {/* Headline */}
      <View style={styles.header}>
        <Text style={[Typography.headlineLg, { color: C.primary }]}>Vérifier votre numéro</Text>
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.sm }]}>
          {'Un code à 6 chiffres a été envoyé au '}
          <Text style={{ color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            {maskedPhone}
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
          <Pressable onPress={resend}>
            <Text style={[Typography.bodyMd, { color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }]}>
              Renvoyer le code
            </Text>
          </Pressable>
        )}
      </View>

      {/* Verify CTA */}
      <Pressable
        onPress={verify}
        disabled={loading || otp.length < 6}
        style={[
          styles.submitBtn,
          { backgroundColor: C.primary, opacity: loading || otp.length < 6 ? 0.5 : 1 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={C.onPrimary} />
        ) : (
          <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
            Vérifier
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
