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
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators/auth.schema';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(_data: ForgotPasswordFormValues) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <View style={[styles.root, { backgroundColor: C.surface, paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom }]}>
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: C.surfaceContainer }]}>
            <MaterialIcons name="mark-email-read" size={40} color={C.primary} />
          </View>
          <Text style={[Typography.headlineMd, { color: C.onSurface, textAlign: 'center', marginTop: Spacing.xl }]}>
            Email envoyé !
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm }]}>
            Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/reset-password')}
            style={[styles.submitBtn, { backgroundColor: C.primary, marginTop: Spacing.xxl }]}
          >
            <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
              Saisir le code
            </Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginTop: Spacing.lg }}>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>Retour à la connexion</Text>
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

        {/* Headline */}
        <View style={styles.header}>
          <Text style={[Typography.headlineLg, { color: C.primary }]}>Mot de passe oublié</Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs }]}>
            Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Adresse e-mail"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
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
                Envoyer le code
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.marginMobile,
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
