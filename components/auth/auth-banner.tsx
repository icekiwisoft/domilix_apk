import { Image } from 'expo-image';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, IconButton } from '@/components/ui';
import { Radius, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

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
  const C = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: height + insets.top }}>
      <Image
        source={MASCOT}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderBottomLeftRadius: Radius.banner,
          borderBottomRightRadius: Radius.banner,
        }}
        contentFit="cover"
        contentPosition={{ left: '50%', top: focusY }}
        accessible
        accessibilityLabel="La mascotte Domilix, un écureuil, devant un quartier résidentiel"
      />
      <View
        style={{
          position: 'absolute',
          top: insets.top + Spacing.md,
          left: onBack ? Spacing.md : Spacing.marginMobile,
          right: Spacing.marginMobile,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: onBack ? 'space-between' : 'flex-start',
        }}
      >
        {onBack ? <IconButton icon="arrow-back" label="Retour" overlay onPress={onBack} /> : null}
        <View
          accessibilityRole="header"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.xs + Spacing.xxs,
            paddingLeft: Spacing.xs + Spacing.xxs,
            paddingRight: Spacing.ms + Spacing.xxs,
            borderRadius: Radii.full,
            backgroundColor: C.bannerChip,
          }}
        >
          <Image
            source={LOGO}
            style={{ width: Sizes.authLogoWidth, height: Sizes.authLogoHeight }}
            contentFit="contain"
            accessible={false}
          />
          <AppText variant="brand" color="onBannerChip">
            Domilix
          </AppText>
        </View>
      </View>
    </View>
  );
}
