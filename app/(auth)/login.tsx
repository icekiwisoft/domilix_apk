import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

import { Input } from '@/components/ui/input';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useLogin } from '@/hooks/queries/use-auth-queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loginSchema, resolveLoginDto, type LoginFormValues } from '@/lib/validators/auth.schema';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [showPwd, setShowPwd] = useState(false);
  const login = useLogin();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  function onSubmit(data: LoginFormValues) {
    login.mutate(
      resolveLoginDto(data.identifier.trim(), data.password),
      { onSuccess: () => redirect ? router.replace(redirect as never) : router.replace('/(tabs)') }
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
        {router.canGoBack() && (
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { borderColor: C.outlineVariant }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={C.onSurfaceVariant} />
          </Pressable>
        )}

        {/* Headline */}
        <View style={styles.header}>
          <Text style={[Typography.headlineLg, { color: C.primary }]}>Se connecter</Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs }]}>
            Bon retour parmi nous.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Identifiant */}
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email ou numéro de téléphone"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="email@exemple.com ou +237 6XX XXX XXX"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.identifier?.message}
                leftElement={
                  <MaterialIcons name="person-outline" size={20} color={C.onSurfaceVariant} />
                }
              />
            )}
          />

          {/* Mot de passe */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPwd}
                error={errors.password?.message}
                leftElement={
                  <MaterialIcons name="lock-outline" size={20} color={C.onSurfaceVariant} />
                }
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

          {/* Mot de passe oublié */}
          <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotRow}>
            <Text style={[Typography.caption, { color: C.primary }]}>Mot de passe oublié ?</Text>
          </Pressable>

          {/* Erreur serveur */}
          {login.error && (
            <View style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}>
              <MaterialIcons name="error-outline" size={16} color={C.error} />
              <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
                Identifiant ou mot de passe incorrect.
              </Text>
            </View>
          )}

          {/* Bouton */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={login.isPending}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: C.primary, opacity: login.isPending ? 0.7 : pressed ? 0.88 : 1 },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            {login.isPending ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
                Se connecter
              </Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
            {'Pas encore de compte ? '}
            <Text
              style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}
              onPress={() => router.push('/(auth)/register')}
            >
              {"S'inscrire"}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
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
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: 'rgb(232, 146, 26)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
});
