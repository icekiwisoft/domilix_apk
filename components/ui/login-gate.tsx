import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { Button } from './button';

interface LoginGateProps {
  title: string;
  subtitle: string;
}

/**
 * Guest placeholder of the account screens (favourites, notifications,
 * profile): lock icon, why to sign in, and the two ways in. Kit buttons give
 * TalkBack the bare label, without the icon glyph Paper's button read first
 * (QA-06, UI-09).
 */
export function LoginGate({ title, subtitle }: LoginGateProps) {
  const C = useThemeColors();
  const router = useRouter();
  return (
    <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.lg }}>
      <View
        importantForAccessibility="no-hide-descendants"
        style={{
          width: Sizes.stateIcon,
          height: Sizes.stateIcon,
          borderRadius: Radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C.primaryFixed,
        }}
      >
        <MaterialIcons name="lock-outline" size={Sizes.stateIcon / 2} color={C.onPrimaryFixed} />
      </View>
      <View style={{ alignItems: 'center', gap: Spacing.sm }}>
        <AppText variant="headline" accessibilityRole="header" style={{ textAlign: 'center' }}>
          {title}
        </AppText>
        <AppText color="onSurfaceVariant" style={{ textAlign: 'center' }}>
          {subtitle}
        </AppText>
      </View>
      <View style={{ alignSelf: 'stretch', gap: Spacing.ms }}>
        <Button label="Se connecter" icon="login" size="lg" fullWidth onPress={() => router.push('/(auth)/login')} />
        <Button
          label="Créer un compte"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/register')}
        />
      </View>
    </View>
  );
}
