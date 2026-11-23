import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { pressedStyle } from '@/components/ui/pressed';
import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useThemeColors } from '@/hooks/use-theme-color';

// Shown above the search bars (Accueil, Explorer): contact details and exact
// addresses are unlocked with Domicoins, bought from the packs screen.
export function DomicoinBadge() {
  const C = useThemeColors();
  const router = useRouter();
  const { data: me } = useMe();
  const credits = me?.credits ?? 0;
  const hasCredits = credits > 0;
  const message = hasCredits
    ? `${credits} Domicoin${credits > 1 ? 's' : ''} pour débloquer les contacts des annonces`
    : 'Achetez des Domicoins pour voir les contacts et infos des annonces';

  return (
    <Pressable
      onPress={() => router.push('/profile/subscriptions')}
      accessibilityRole="button"
      accessibilityLabel={`${message}. ${hasCredits ? 'Recharger' : 'Acheter'}`}
      style={({ pressed }) => [styles.badge, { backgroundColor: C.surfaceContainerHigh }, pressedStyle(pressed)]}
    >
      <View style={[styles.coin, { backgroundColor: C.primaryContainer }]}>
        <MaterialIcons name="toll" size={Sizes.iconSm} color={C.onPrimaryContainer} />
      </View>
      <AppText variant="bodySm" style={styles.text}>
        {message}
      </AppText>
      <AppText variant="label" color="link">
        {hasCredits ? 'Recharger' : 'Acheter'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: Sizes.touchTarget,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.control,
  },
  coin: {
    width: Sizes.iconLg,
    height: Sizes.iconLg,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
});
