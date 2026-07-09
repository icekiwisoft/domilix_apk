import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/input';
import { useSendResetEmail } from '@/hooks/queries/use-auth-queries';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators/auth.schema';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [sentEmail, setSentEmail] = useState('');
  const sendReset = useSendResetEmail();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    sendReset.mutate(data.email, { onSuccess: () => setSentEmail(data.email) });
  }

  if (sendReset.isSuccess) {
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
          <Button
            mode="contained"
            onPress={() => router.push({ pathname: '/(auth)/reset-password', params: { email: sentEmail } })}
            style={styles.submitBtn}
            contentStyle={styles.submitBtnContent}
          >
            Saisir le code
          </Button>
          <Button mode="text" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: Spacing.lg }}>
            Retour à la connexion
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

          {sendReset.error && (
            <View style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}>
              <MaterialIcons name="error-outline" size={16} color={C.error} />
              <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
                Impossible d'envoyer l'email. Vérifiez l'adresse et réessayez.
              </Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={sendReset.isPending}
            disabled={sendReset.isPending}
            contentStyle={styles.submitBtnContent}
            style={styles.submitBtn}
          >
            Envoyer le code
          </Button>
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
