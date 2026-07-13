import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGoogleSignIn } from '@/hooks/use-google-signin';
import { useFirebaseLogin } from '@/hooks/queries/use-auth-queries';
import { GoogleLogo } from './google-logo';

interface GoogleSignInButtonProps {
  redirectTo?: string;
}

export function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { signIn, isReady, isLoading: isGoogleLoading } = useGoogleSignIn();
  const firebaseLogin = useFirebaseLogin();
  const [error, setError] = useState(false);

  async function handlePress() {
    setError(false);
    const idToken = await signIn();
    if (!idToken) return;
    firebaseLogin.mutate(idToken, {
      onSuccess: () => router.replace((redirectTo ?? '/(tabs)') as never),
      onError: () => setError(true),
    });
  }

  const isLoading = isGoogleLoading || firebaseLogin.isPending;

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />
        <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>ou</Text>
        <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />
      </View>

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}>
          <MaterialIcons name="error-outline" size={16} color={C.error} />
          <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
            Connexion avec Google impossible. Réessayez.
          </Text>
        </View>
      )}

      <Button
        mode="outlined"
        onPress={handlePress}
        loading={isLoading}
        disabled={!isReady || isLoading}
        icon={({ size }) => <GoogleLogo size={size} />}
        contentStyle={styles.btnContent}
        style={styles.btn}
      >
        Continuer avec Google
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  divider: { flex: 1, height: 1 },
  btn: { borderRadius: Radius.md },
  btnContent: { height: 50 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
});
