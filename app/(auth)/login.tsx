import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBanner } from '@/components/auth/auth-banner';
import { AuthDivider } from '@/components/auth/auth-divider';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { goAfterAuth } from '@/components/auth/go-after-auth';
import { AppText, Banner, Button, Field, KeyboardTarget, Screen, pressedStyle } from '@/components/ui';
import { Fonts, Sizes, Spacing } from '@/constants/theme';
import { useLogin } from '@/hooks/queries/use-auth-queries';
import { useThemeColors } from '@/hooks/use-theme-color';
import { loginSchema, resolveLoginDto, type LoginFormValues } from '@/lib/validators/auth.schema';

const LOGIN_ERROR = 'Identifiant ou mot de passe incorrect.';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  // The full example no longer fits on one line from about 130 % font size.
  const { fontScale } = useWindowDimensions();
  // Content height and the banner height it was measured with.
  const [content, setContent] = useState<{ height: number; banner: number }>({ height: 0, banner: Sizes.authBannerTall });
  // Scroll view height with the keyboard closed (0 until laid out).
  const [viewportHeight, setViewportHeight] = useState(0);
  // QA-07: on a 1080×2400 phone at 100 % the screen was ~45 dp taller than the
  // window, so "Explorer les annonces sans compte" rested under the gesture
  // bar. The banner gives up that height so the whole form, footer and bottom
  // inset fit; past that the screen scrolls. The floor is below the sign-up
  // banner size because the "session expirée" notice adds ~31 dp, which the
  // 148 dp floor could not absorb (footer link still on the gesture bar).
  const overflowAtTall = content.height - content.banner + Sizes.authBannerTall - viewportHeight;
  const bannerHeight: number =
    content.height && viewportHeight
      ? Math.min(Sizes.authBannerTall, Math.max(Sizes.authBannerMin, Sizes.authBannerTall - overflowAtTall))
      : Sizes.authBannerTall;
  const C = useThemeColors();
  const router = useRouter();
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
      { onSuccess: () => goAfterAuth(router, redirect, !sessionExpired) }
    );
  }

  return (
    <Screen
      keyboard
      background="surface"
      heroHeight={bannerHeight}
      heroStatusBar="dark"
      onLayout={(e) => {
        if (!Keyboard.isVisible()) setViewportHeight(e.nativeEvent.layout.height);
      }}
      onContentSizeChange={(_w, h) => {
        // With the keyboard open the content shrinks with the viewport; keep
        // the banner as it was instead of resizing it while typing.
        if (!Keyboard.isVisible()) setContent({ height: h, banner: bannerHeight });
      }}
      contentStyle={{ gap: 0, paddingBottom: insets.bottom + Spacing.sm }}
    >
      <AuthBanner
        height={bannerHeight}
        focusY="28%"
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />

      <View
        style={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          gap: Spacing.marginMobile,
        }}
      >
        <View style={{ gap: Spacing.xs }}>
          <AppText variant="title" accessibilityRole="header">
            Logements, terrains et meubles au Cameroun
          </AppText>
          <AppText color="onSurfaceVariant">
            Connectez-vous pour contacter les annonceurs et retrouver vos favoris.
          </AppText>
        </View>

        {sessionExpired && !login.error ? <Banner>Votre session a expiré, reconnectez-vous.</Banner> : null}

        <GoogleSignInButton redirectTo={redirect} targetBelow={!sessionExpired} />

        <AuthDivider label="ou avec votre email ou téléphone" />

        <View style={{ gap: Spacing.md }}>
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Email ou téléphone"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={fontScale > 1.3 ? '6XX XXX XXX' : '+237 6XX XXX XXX ou email'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.identifier?.message}
                leftIcon={<MaterialIcons name="person-outline" size={Sizes.icon} color={C.onSurfaceVariant} />}
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
                labelAction={
                  <Pressable
                    onPress={() => router.push('/(auth)/forgot-password')}
                    accessibilityRole="link"
                    // A real 48 dp target (QA-25): the label row grows to it
                    // instead of a hitSlop that overlapped the password field.
                    style={({ pressed }) => [
                      {
                        minHeight: Sizes.touchTarget,
                        justifyContent: 'center',
                        paddingHorizontal: Spacing.sm,
                        marginRight: -Spacing.sm,
                      },
                      pressedStyle(pressed),
                    ]}
                  >
                    <AppText variant="label" color="link">
                      Mot de passe oublié ?
                    </AppText>
                  </Pressable>
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secure
                autoComplete="current-password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.password?.message}
                leftIcon={<MaterialIcons name="lock-outline" size={Sizes.icon} color={C.onSurfaceVariant} />}
              />
            )}
          />

          <View>
            {/* Always mounted, as in Field: TalkBack reads a live region when its content changes. */}
            <View accessibilityLiveRegion="polite">
              {login.error ? (
                <Banner
                  tone="error"
                  announce={false}
                  accessibilityLabel={`Erreur : ${LOGIN_ERROR}`}
                  style={{ marginBottom: Spacing.md }}
                >
                  {LOGIN_ERROR}
                </Banner>
              ) : null}
            </View>

            <KeyboardTarget>
              <Button
                label="Se connecter"
                size="lg"
                fullWidth
                onPress={handleSubmit(onSubmit)}
                loading={login.isPending}
                style={{ marginTop: Spacing.xs }}
              />
            </KeyboardTarget>
          </View>
        </View>

        <View style={{ marginTop: 'auto', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.push('/(auth)/register')}
            style={({ pressed }) => [footerLink, pressedStyle(pressed)]}
            accessibilityRole="link"
            accessibilityLabel="Pas encore de compte ? S'inscrire"
          >
            <AppText color="onSurfaceVariant" style={centered}>
              {'Pas encore de compte ? '}
              <AppText color="link" style={{ fontFamily: Fonts.bold }}>
                {"S'inscrire"}
              </AppText>
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={({ pressed }) => [footerLink, pressedStyle(pressed)]}
            accessibilityRole="link"
            accessibilityLabel="Explorer les annonces sans compte"
          >
            {/* Arrow inside the text so it follows the last word when the
                label wraps at large font sizes. */}
            <AppText variant="bodyStrong" style={centered}>
              {'Explorer les annonces sans compte '}
              <MaterialIcons name="arrow-forward" size={Sizes.icon} color={C.onSurface} />
            </AppText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const footerLink = {
  minHeight: Sizes.touchTarget,
  justifyContent: 'center',
  paddingHorizontal: Spacing.sm,
} as const;

const centered = { textAlign: 'center', flexShrink: 1 } as const;
