import { MaterialIcons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthBanner } from '@/components/auth/auth-banner';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { useKeyboardReveal } from '@/components/auth/use-keyboard-reveal';
import { Colors, Fonts, Radius, Sizes, Spacing, Typography } from '@/constants/theme';
import { useRegister } from '@/hooks/queries/use-auth-queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth.schema';

const TERMS_URL = 'https://domilix.com/cgu';
const PRIVACY_URL = 'https://domilix.com/privacy-policy';
const MIN_PASSWORD = 8;

/** Keeps the 9 national digits: drops spaces, dashes and a pasted +237 / 00237. */
function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.length > 9 && digits.startsWith('00237')) digits = digits.slice(5);
  else if (digits.length > 9 && digits.startsWith('237')) digits = digits.slice(3);
  return digits.slice(0, 9);
}

/** Cameroon flag (green, red, yellow), decorative. */
function CameroonFlag() {
  return (
    <Svg width={22} height={15} viewBox="0 0 3 2" accessible={false}>
      <Rect width={1} height={2} fill="#007a5e" />
      <Rect x={1} width={1} height={2} fill="#ce1126" />
      <Rect x={2} width={1} height={2} fill="#fcd116" />
    </Svg>
  );
}

/**
 * Field errors returned by POST /auth/register (backend auth.service.ts):
 * 400 { errors: { phone_number: ['The phone number has already been taken.'] } },
 * { errors: { email: ['The email has already been taken.'] } } and
 * { errors: { phone_number: ['Le numero de telephone est invalide.'] } }.
 * Anything else (other 4xx/5xx, network) keeps the generic banner.
 */
function serverFieldErrors(error: unknown): { phone?: string; email?: string } {
  if (!isAxiosError(error) || error.response?.status !== 400) return {};
  const fields = (error.response.data as { errors?: Record<string, unknown> } | undefined)?.errors;
  if (!fields) return {};
  const first = (v: unknown) => (Array.isArray(v) && typeof v[0] === 'string' ? (v[0] as string) : undefined);
  const out: { phone?: string; email?: string } = {};
  const phone = first(fields.phone_number);
  if (phone) {
    out.phone = /already been taken/i.test(phone)
      ? 'Ce numéro est déjà utilisé. Connectez-vous ou utilisez un autre numéro.'
      : 'Ce numéro de téléphone est invalide.';
  }
  const email = first(fields.email);
  if (email) {
    out.email = /already been taken/i.test(email)
      ? 'Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.'
      : 'Cette adresse e-mail est invalide.';
  }
  return out;
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { scrollRef, targetRef, onScroll, pastBanner } = useKeyboardReveal(Sizes.authBannerShort);
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const register = useRegister();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', terms: undefined as any },
  });
  const serverErrors = serverFieldErrors(register.error);
  const passwordLongEnough = watch('password').length >= MIN_PASSWORD;

  function onSubmit(data: RegisterFormValues) {
    const phoneNumber = `+237${data.phone}`;
    register.mutate(
      { name: data.name, email: data.email || undefined, phone_number: phoneNumber, password: data.password },
      {
        onSuccess: (res) =>
          router.push({
            pathname: '/(auth)/verify-phone/[user_id]',
            params: { user_id: res.user.id, phone: phoneNumber },
          }),
      }
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.surface }}
      // 'padding' on Android too: with edge-to-edge the window is not resized, and
      // 'height' left a blank band at the bottom after the keyboard closed.
      behavior="padding"
    >
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.sm }]}
        keyboardShouldPersistTaps="handled"
      >
        <AuthBanner
          height={Sizes.authBannerShort}
          focusY="22%"
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
        />

        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={[Typography.titleLg, { color: C.onSurface }]} accessibilityRole="header">
              Créer un compte
            </Text>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              Inscrivez-vous avec Google ou avec votre numéro de téléphone.
            </Text>
          </View>

          <GoogleSignInButton label="S'inscrire avec Google" />

          <AuthDivider label="ou avec votre numéro" />

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  label="Nom d'utilisateur"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Votre prénom ou pseudo"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  ref={phoneRef}
                  label="Numéro de téléphone"
                  value={value}
                  onChangeText={(text) => onChange(normalizePhone(text))}
                  onBlur={onBlur}
                  placeholder="6XX XXX XXX"
                  keyboardType="phone-pad"
                  autoComplete="tel-national"
                  textContentType="telephoneNumber"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  accessibilityLabel="Numéro de téléphone, après l'indicatif +237"
                  error={errors.phone?.message ?? serverErrors.phone}
                  prefix={
                    <>
                      <CameroonFlag />
                      <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: Fonts.semiBold }]}>
                        +237
                      </Text>
                    </>
                  }
                  helper={
                    <Text style={[Typography.helper, { color: C.onSurfaceVariant }]}>
                      Nous vous enverrons un code par SMS pour vérifier ce numéro.
                    </Text>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  ref={emailRef}
                  label="Email"
                  labelHint="(facultatif)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="vous@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  error={errors.email?.message ?? serverErrors.email}
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
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPwd}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  error={errors.password?.message}
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
                  helper={
                    <View style={styles.rule} accessibilityLiveRegion="polite">
                      <MaterialIcons
                        name={passwordLongEnough ? 'check' : 'radio-button-unchecked'}
                        size={16}
                        color={passwordLongEnough ? C.success : C.onSurfaceVariant}
                      />
                      <Text
                        style={[Typography.helper, { color: passwordLongEnough ? C.success : C.onSurfaceVariant }]}
                        accessibilityLabel={
                          passwordLongEnough ? 'Au moins 8 caractères : respecté' : 'Au moins 8 caractères'
                        }
                      >
                        Au moins 8 caractères
                      </Text>
                    </View>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="terms"
              render={({ field: { onChange, value } }) => (
                <View>
                  <View style={styles.termsRow}>
                    <Pressable
                      onPress={() => onChange(value ? undefined : true)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: !!value }}
                      accessibilityLabel="J'accepte les conditions d'utilisation et la politique de confidentialité"
                      style={styles.checkboxTarget}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: errors.terms ? C.error : value ? C.link : C.outline,
                            backgroundColor: value ? C.link : C.fieldSurface,
                          },
                        ]}
                      >
                        {value && <MaterialIcons name="check" size={16} color={C.surface} />}
                      </View>
                    </Pressable>
                    <Text style={[Typography.bodySm, styles.termsText, { color: C.onSurfaceVariant }]}>
                      {"J'accepte les "}
                      <Text
                        style={{ color: C.link, fontFamily: Fonts.bold }}
                        onPress={() => Linking.openURL(TERMS_URL)}
                        accessibilityRole="link"
                      >
                        {"conditions d'utilisation"}
                      </Text>
                      {' et la '}
                      <Text
                        style={{ color: C.link, fontFamily: Fonts.bold }}
                        onPress={() => Linking.openURL(PRIVACY_URL)}
                        accessibilityRole="link"
                      >
                        politique de confidentialité
                      </Text>
                      {'.'}
                    </Text>
                  </View>
                  {errors.terms && (
                    <Text style={[Typography.helper, { color: C.error }]} accessibilityLiveRegion="polite">
                      {errors.terms.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {register.error && !serverErrors.phone && !serverErrors.email && (
              <View
                style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}
                accessibilityLiveRegion="polite"
              >
                <MaterialIcons name="error-outline" size={16} color={C.error} />
                <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
                  Impossible de créer le compte. Vérifiez vos informations et réessayez.
                </Text>
              </View>
            )}

            <View ref={targetRef} collapsable={false}>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={register.isPending}
                disabled={register.isPending}
                buttonColor={C.cta}
                textColor={C.onCta}
                contentStyle={styles.submitContent}
                labelStyle={styles.submitLabel}
                style={styles.submit}
              >
                Créer mon compte
              </Button>
            </View>
          </View>

          <Pressable
            onPress={() => router.dismissTo('/(auth)/login')}
            style={styles.footerLink}
            accessibilityRole="link"
            accessibilityLabel="Déjà inscrit ? Se connecter"
          >
            <Text style={[Typography.bodyMd, styles.centered, { color: C.onSurfaceVariant }]}>
              {'Déjà inscrit ? '}
              <Text style={{ color: C.link, fontFamily: Fonts.bold }}>Se connecter</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      {pastBanner && (
        <View style={[styles.statusBand, { height: insets.top, backgroundColor: C.surface }]} />
      )}
      {/* Dark icons over the light photo, theme icons once the band is shown. */}
      <StatusBar style={pastBanner && scheme === 'dark' ? 'light' : 'dark'} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  statusBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
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
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // 48 dp touch target; the visible 22 dp box stays aligned with the fields.
  checkboxTarget: {
    width: Sizes.touchTarget,
    height: Sizes.touchTarget,
    marginLeft: -(Sizes.touchTarget - 22) / 2,
    marginTop: -Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    paddingTop: Spacing.xs / 2,
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
  footerLink: {
    marginTop: 'auto',
    alignSelf: 'center',
    minHeight: Sizes.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
});
