import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Sizes, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MASCOT = require('@/assets/images/domilix-mascot.jpg');
const LOGO = require('@/assets/images/domilix-logo.png');

interface AuthBannerProps {
  /** Banner height without the status bar inset. */
  height: number;
  /** Vertical focus of the photo (CSS object-position style percentage). */
  focusY: `${number}%`;
  /** Shows a 48 dp back button on the left when set. */
  onBack?: () => void;
}

/** Mascot photo with the Domilix badge, top of the sign-in and sign-up screens. */
export function AuthBanner({ height, focusY, onBack }: AuthBannerProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: height + insets.top }}>
      <Image
        source={MASCOT}
        style={styles.photo}
        contentFit="cover"
        contentPosition={{ left: '50%', top: focusY }}
        accessible
        accessibilityLabel="La mascotte Domilix, un écureuil, devant un quartier résidentiel"
      />
      <View
        style={[
          styles.overlay,
          {
            top: insets.top + Spacing.md,
            left: onBack ? Spacing.md : Spacing.marginMobile,
            justifyContent: onBack ? 'space-between' : 'flex-start',
          },
        ]}
      >
        {onBack && (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Retour"
            style={[styles.back, { backgroundColor: C.bannerChip }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={C.onBannerChip} />
          </Pressable>
        )}
        <View style={[styles.badge, { backgroundColor: C.bannerChip }]} accessibilityRole="header">
          <Image source={LOGO} style={styles.logo} contentFit="contain" accessible={false} />
          <Text style={[styles.badgeText, { color: C.onBannerChip }]}>Domilix</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: Radius.banner,
    borderBottomRightRadius: Radius.banner,
  },
  overlay: {
    position: 'absolute',
    right: Spacing.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    width: Sizes.touchTarget,
    height: Sizes.touchTarget,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: Radius.full,
  },
  logo: {
    width: 32,
    height: 28,
  },
  badgeText: {
    ...Typography.labelMd,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Typography.titleLg.fontFamily,
    fontWeight: Typography.titleLg.fontWeight,
  },
});
