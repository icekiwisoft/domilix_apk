import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBanner } from '@/components/auth/auth-banner';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { Colors, Fonts, Radius, Sizes, Spacing, Typography } from '@/constants/theme';
import { useLogin } from '@/hooks/queries/use-auth-queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loginSchema, resolveLoginDto, type LoginFormValues } from '@/lib/validators/auth.schema';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const login = useLogin();
  const { redirect, reason } = useLocalSearchParams<{ redirect?: string; reason?: string }>();
  // Set by AuthProvider when the server refused the session (B-05).
  const sessionExpired = reason === 'session-expired';

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
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.sm }]}
        keyboardShouldPersistTaps="handled"
      >
        <AuthBanner
          height={Sizes.authBannerTall}
          focusY="28%"
          onBack={router.canGoBack() ? () => router.back() : undefined}
        />

        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={[Typography.titleLg, { color: C.onSurface }]} accessibilityRole="header">
              Logements, terrains et meubles au Cameroun
            </Text>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              Connectez-vous pour contacter les annonceurs et retrouver vos favoris.
            </Text>
          </View>

          {sessionExpired && !login.error && (
            <View
              style={[styles.noticeBanner, { backgroundColor: C.surfaceContainerHigh, borderColor: C.outlineVariant }]}
              accessibilityLiveRegion="polite"
            >
              <MaterialIcons name="info-outline" size={18} color={C.onSurface} />
              <Text style={[Typography.bodySm, { color: C.onSurface, flex: 1 }]}>
                Votre session a expiré, reconnectez-vous.
              </Text>
            </View>
          )}

          <GoogleSignInButton redirectTo={redirect} />

          <AuthDivider label="ou avec votre email ou téléphone" />

          <View style={styles.form}>
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  label="Email ou téléphone"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="+237 6XX XXX XXX ou email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  error={errors.identifier?.message}
                  leftIcon={<MaterialIcons name="person-outline" size={20} color={C.onSurfaceVariant} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  ref={passwordRef}
                  label="Mot de passe"
                  labelAction={
                    <Pressable
                      onPress={() => router.push('/(auth)/forgot-password')}
                      hitSlop={{ top: 14, bottom: 14, left: Spacing.sm, right: Spacing.sm }}
                      accessibilityRole="link"
                    >
                      <Text style={[Typography.labelMd, { color: C.link }]}>Mot de passe oublié ?</Text>
                    </Pressable>
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPwd}
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  error={errors.password?.message}
                  leftIcon={<MaterialIcons name="lock-outline" size={20} color={C.onSurfaceVariant} />}
                  rightElement={
                    <Pressable
                      onPress={() => setShowPwd((v) => !v)}
                      style={styles.iconBtn}
                      accessibilityRole="button"
                      accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      <MaterialIcons
                        name={showPwd ? 'visibility-off' : 'visibility'}
                        size={22}
                        color={C.onSurfaceVariant}
                      />
                    </Pressable>
                  }
                />
              )}
            />

            {login.error && (
              <View
                style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}
                accessibilityLiveRegion="polite"
              >
                <MaterialIcons name="error-outline" size={16} color={C.error} />
                <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
                  Identifiant ou mot de passe incorrect.
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={login.isPending}
              disabled={login.isPending}
              buttonColor={C.cta}
              textColor={C.onCta}
              contentStyle={styles.submitContent}
              labelStyle={styles.submitLabel}
              style={styles.submit}
            >
              Se connecter
            </Button>
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              style={styles.footerLink}
              accessibilityRole="link"
              accessibilityLabel="Pas encore de compte ? S'inscrire"
            >
              <Text style={[Typography.bodyMd, styles.centered, { color: C.onSurfaceVariant }]}>
                {'Pas encore de compte ? '}
                <Text style={{ color: C.link, fontFamily: Fonts.bold }}>{"S'inscrire"}</Text>
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              style={[styles.footerLink, styles.exploreLink]}
              accessibilityRole="link"
            >
              <Text style={[Typography.bodyMd, styles.centered, { color: C.onSurface, fontFamily: Fonts.semiBold }]}>
                Explorer les annonces sans compte
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color={C.onSurface} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.marginMobile,
  },
  header: {
    gap: Spacing.xs,
  },
  form: {
    gap: Spacing.md,
  },
  iconBtn: {
    width: Sizes.touchTarget,
    height: Sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  submit: {
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  submitContent: {
    minHeight: Sizes.control,
  },
  submitLabel: {
    fontFamily: Fonts.bold,
    fontSize: Typography.bodyMd.fontSize,
    lineHeight: 22,
    letterSpacing: 0,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerLink: {
    minHeight: Sizes.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  exploreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  centered: {
    textAlign: 'center',
    flexShrink: 1,
  },
});
