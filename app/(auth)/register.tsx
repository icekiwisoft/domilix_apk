import { MaterialIcons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Linking, Pressable, TextInput, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBanner } from '@/components/auth/auth-banner';
import { AuthDivider } from '@/components/auth/auth-divider';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { AppText, Banner, Button, Field, KeyboardTarget, Screen, pressedStyle } from '@/components/ui';
import { Borders, Fonts, Radii, Sizes, Spacing } from '@/constants/theme';
import { useRegister } from '@/hooks/queries/use-auth-queries';
import { useThemeColors } from '@/hooks/use-theme-color';
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
  const C = useThemeColors();
  return (
    <Svg width={Sizes.flagWidth} height={Sizes.flagHeight} viewBox="0 0 3 2" accessible={false}>
      <Rect width={1} height={2} fill={C.flagGreen} />
      <Rect x={1} width={1} height={2} fill={C.flagRed} />
      <Rect x={2} width={1} height={2} fill={C.flagYellow} />
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
  const C = useThemeColors();
  const router = useRouter();
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
    <Screen
      keyboard
      background="surface"
      heroHeight={Sizes.authBannerShort}
      heroStatusBar="dark"
      contentStyle={{ gap: 0, paddingBottom: insets.bottom + Spacing.sm }}
    >
      <AuthBanner
        height={Sizes.authBannerShort}
        focusY="22%"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
      />

      <View style={{ flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md }}>
        <View style={{ gap: Spacing.xs }}>
          <AppText variant="title" accessibilityRole="header">
            Créer un compte
          </AppText>
          <AppText color="onSurfaceVariant">Inscrivez-vous avec Google ou avec votre numéro de téléphone.</AppText>
        </View>

        <GoogleSignInButton label="S'inscrire avec Google" />

        <AuthDivider label="ou avec votre numéro" />

        <View style={{ gap: Spacing.md }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
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
              <Field
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
                // Room between the +237 prefix and the number, as in UI-02.
                style={{ paddingLeft: Spacing.md }}
                error={errors.phone?.message ?? serverErrors.phone}
                prefix={
                  <>
                    <CameroonFlag />
                    <AppText variant="bodyStrong">+237</AppText>
                  </>
                }
                helper="Nous vous enverrons un code par SMS pour vérifier ce numéro."
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
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
              <Field
                ref={passwordRef}
                label="Mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secure
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                error={errors.password?.message}
                helperContent={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                    <MaterialIcons
                      name={passwordLongEnough ? 'check' : 'radio-button-unchecked'}
                      size={Sizes.iconSm}
                      color={passwordLongEnough ? C.success : C.onSurfaceVariant}
                    />
                    <AppText
                      variant="caption"
                      color={passwordLongEnough ? 'success' : 'onSurfaceVariant'}
                      accessibilityLabel={
                        passwordLongEnough ? 'Au moins 8 caractères : respecté' : 'Au moins 8 caractères'
                      }
                    >
                      Au moins 8 caractères
                    </AppText>
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Pressable
                    onPress={() => onChange(value ? undefined : true)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: !!value }}
                    accessibilityLabel="J'accepte les conditions d'utilisation et la politique de confidentialité"
                    // 48 dp touch target; the visible box stays aligned with the fields.
                    style={({ pressed }) => [
                      {
                        width: Sizes.touchTarget,
                        height: Sizes.touchTarget,
                        marginLeft: -(Sizes.touchTarget - Sizes.checkbox) / 2,
                        marginTop: -Spacing.sm,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                      pressedStyle(pressed),
                    ]}
                  >
                    <View
                      style={{
                        width: Sizes.checkbox,
                        height: Sizes.checkbox,
                        borderRadius: Radii.badge,
                        borderWidth: Borders.focus,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: errors.terms ? C.error : value ? C.link : C.outline,
                        backgroundColor: value ? C.link : C.fieldSurface,
                      }}
                    >
                      {value ? <MaterialIcons name="check" size={Sizes.iconSm} color={C.surface} /> : null}
                    </View>
                  </Pressable>
                  <AppText variant="bodySm" color="onSurfaceVariant" style={{ flex: 1, paddingTop: Spacing.xxs }}>
                    {"J'accepte les "}
                    <AppText
                      variant="bodySm"
                      color="link"
                      style={{ fontFamily: Fonts.bold }}
                      onPress={() => Linking.openURL(TERMS_URL)}
                      accessibilityRole="link"
                    >
                      {"conditions d'utilisation"}
                    </AppText>
                    {' et la '}
                    <AppText
                      variant="bodySm"
                      color="link"
                      style={{ fontFamily: Fonts.bold }}
                      onPress={() => Linking.openURL(PRIVACY_URL)}
                      accessibilityRole="link"
                    >
                      politique de confidentialité
                    </AppText>
                    {'.'}
                  </AppText>
                </View>
                {errors.terms ? (
                  <AppText variant="caption" color="error" accessibilityLiveRegion="polite">
                    {errors.terms.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          {register.error && !serverErrors.phone && !serverErrors.email ? (
            <Banner tone="error">Impossible de créer le compte. Vérifiez vos informations et réessayez.</Banner>
          ) : null}

          <KeyboardTarget>
            <Button
              label="Créer mon compte"
              size="lg"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              loading={register.isPending}
              style={{ marginTop: Spacing.xs }}
            />
          </KeyboardTarget>
        </View>

        <Pressable
          onPress={() => router.dismissTo('/(auth)/login')}
          style={({ pressed }) => [
            {
              marginTop: 'auto',
              alignSelf: 'center',
              minHeight: Sizes.touchTarget,
              justifyContent: 'center',
              paddingHorizontal: Spacing.sm,
            },
            pressedStyle(pressed),
          ]}
          accessibilityRole="link"
          accessibilityLabel="Déjà inscrit ? Se connecter"
        >
          <AppText color="onSurfaceVariant" style={{ textAlign: 'center' }}>
            {'Déjà inscrit ? '}
            <AppText color="link" style={{ fontFamily: Fonts.bold }}>
              Se connecter
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
