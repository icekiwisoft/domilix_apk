import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
          <IconButton
            icon="arrow-left"
            mode="outlined"
            size={22}
            onPress={() => router.back()}
            accessibilityLabel="Retour"
            style={styles.backBtn}
          />
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

          {/* Mot de passe oublié */}
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotRow}
            accessibilityRole="link"
          >
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
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={login.isPending}
            disabled={login.isPending}
            contentStyle={styles.submitBtnContent}
            style={styles.submitBtn}
          >
            Se connecter
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
            {'Pas encore de compte ? '}
            <Text
              style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}
              onPress={() => router.push('/(auth)/register')}
              accessibilityRole="link"
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
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  submitBtnContent: {
    height: 50,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
});
