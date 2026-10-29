import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { goAfterAuth } from '@/components/auth/go-after-auth';
import { Colors, Fonts, Radius, Sizes, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGoogleSignIn } from '@/hooks/use-google-signin';
import { useFirebaseLogin } from '@/hooks/queries/use-auth-queries';
import { GoogleLogo } from './google-logo';

interface GoogleSignInButtonProps {
  redirectTo?: string;
  /** The screen to go back to is still under this one (see goAfterAuth). */
  targetBelow?: boolean;
  /** "Continuer avec Google" on sign-in, "S'inscrire avec Google" on sign-up. */
  label?: string;
}

/**
 * Google sign-in button in Google's official style (white or #131314 surface,
 * grey outline, multicolour logo), as required by Google's branding guidelines.
 */
export function GoogleSignInButton({ redirectTo, targetBelow = false, label = 'Continuer avec Google' }: GoogleSignInButtonProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { signIn, isReady, isLoading: isGoogleLoading, errorMessage: googleError } = useGoogleSignIn();
  const firebaseLogin = useFirebaseLogin();
  const [error, setError] = useState(false);

  async function handlePress() {
    setError(false);
    const idToken = await signIn();
    if (!idToken) return;
    firebaseLogin.mutate(idToken, {
      onSuccess: () => goAfterAuth(router, redirectTo, targetBelow),
      onError: () => setError(true),
    });
  }

  const isLoading = isGoogleLoading || firebaseLogin.isPending;

  return (
    <View style={styles.container}>
      <Button
        mode="outlined"
        onPress={handlePress}
        loading={isLoading}
        disabled={!isReady || isLoading}
        icon={() => <GoogleLogo size={20} />}
        buttonColor={C.googleSurface}
        textColor={C.onGoogleSurface}
        rippleColor={C.googleOutline + '33'}
        contentStyle={styles.btnContent}
        labelStyle={styles.label}
        style={[styles.btn, { borderColor: C.googleOutline }]}
      >
        {label}
      </Button>

      {(error || googleError) && (
        <View
          style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}
          accessibilityLiveRegion="polite"
        >
          <MaterialIcons name="error-outline" size={16} color={C.error} />
          <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
            {error ? 'Connexion avec Google impossible. Réessayez.' : googleError}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  btn: { borderRadius: Radius.full, borderWidth: 1 },
  btnContent: { minHeight: Sizes.control },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
});
