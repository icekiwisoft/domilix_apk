import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoginGateProps {
  title: string;
  subtitle: string;
}

export function LoginGate({ title, subtitle }: LoginGateProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Icon with layered circles for depth */}
      <View style={styles.iconStack}>
        <View style={[styles.iconOuter, { backgroundColor: C.primaryFixed + '55' }]} />
        <View style={[styles.iconInner, { backgroundColor: C.primaryFixed }]}>
          <MaterialIcons name="lock-outline" size={36} color={C.primary} />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>
          {title}
        </Text>
        <Text style={[Typography.bodyMd, styles.subtitle, { color: C.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button mode="contained" icon="login" onPress={() => router.push('/(auth)/login')}>
          Se connecter
        </Button>
        <Button mode="outlined" onPress={() => router.push('/(auth)/register')}>
          Créer un compte
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginMobile,
    gap: Spacing.xl,
  },
  iconStack: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: Radius.full,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
});
