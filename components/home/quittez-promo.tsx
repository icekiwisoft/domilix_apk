import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { openQuittez } from '@/lib/quittez';

const ICON_SIZE = 56;

/** Card promoting Quittez le pays, the sister app for studying abroad. */
export function QuittezPromo() {
  const C = useThemeColors();
  return (
    <Card
      onPress={openQuittez}
      accessibilityRole="link"
      accessibilityLabel="Découvrir Quittez le pays, l'application pour préparer vos études à l'étranger"
    >
      <View style={styles.row}>
        <Image
          source={require('@/assets/images/quittez-icon.png')}
          style={styles.icon}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.text}>
          <AppText variant="caption" color="link">
            Nouvelle app Domilix
          </AppText>
          <AppText variant="bodyStrong">Quittez le pays</AppText>
          <AppText variant="bodySm" color="onSurfaceVariant">
            Préparez vos études et votre départ à l&apos;étranger, étape par étape, avec votre compte Domilix.
          </AppText>
        </View>
        <MaterialIcons name="open-in-new" size={Sizes.icon} color={C.onSurfaceVariant} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.ms },
  icon: { width: ICON_SIZE, height: ICON_SIZE, borderRadius: Radii.tile },
  text: { flex: 1, gap: Spacing.xxs },
});
