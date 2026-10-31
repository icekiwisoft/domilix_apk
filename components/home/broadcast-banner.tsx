import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { AppText, pressedStyle } from '@/components/ui';
import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/use-theme-color';
import type { Broadcast } from '@/types/announce';

interface BroadcastBannerProps {
  broadcast: Broadcast;
  onPress?: () => void;
}

/**
 * Server broadcast (title, subtitle, badge, call to action, image) on the
 * dark promo card of the mock-up. The texts come from the API as they are.
 * The whole card is one button; the call to action is drawn as a pill.
 */
export function BroadcastBanner({ broadcast, onPress }: BroadcastBannerProps) {
  const C = useThemeColors();
  const scheme = useColorScheme();
  const spoken = [broadcast.badge, broadcast.title, broadcast.subtitle, broadcast.cta].filter(Boolean).join('. ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={spoken}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          padding: Spacing.marginMobile,
          borderRadius: Radii.card,
          backgroundColor: C.promoSurface,
        },
        // The dark card barely stands out on the dark page: give it an edge there.
        scheme === 'dark' ? { borderWidth: Borders.thin, borderColor: C.outlineVariant } : null,
        pressedStyle(pressed),
      ]}
    >
      <View style={{ flex: 1, gap: Spacing.xs }}>
        {broadcast.badge ? (
          <AppText variant="caption" color="onPromoVariant">
            {broadcast.badge}
          </AppText>
        ) : null}
        <AppText variant="headline" color="onPromo">
          {broadcast.title}
        </AppText>
        {broadcast.subtitle ? (
          <AppText variant="body" color="onPromoVariant">
            {broadcast.subtitle}
          </AppText>
        ) : null}
        {broadcast.cta ? (
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: Spacing.xs,
              minHeight: Sizes.touchTarget,
              justifyContent: 'center',
              paddingHorizontal: Spacing.md,
              borderRadius: Radii.full,
              backgroundColor: C.cta,
            }}
          >
            <AppText variant="label" color="onCta">
              {broadcast.cta}
            </AppText>
          </View>
        ) : null}
      </View>
      {broadcast.image ? (
        <Image
          source={{ uri: broadcast.image }}
          accessible={false}
          contentFit="contain"
          cachePolicy="memory-disk"
          style={{ width: Sizes.avatarLg, height: Sizes.avatarLg, borderRadius: Radii.card, backgroundColor: C.background }}
        />
      ) : null}
    </Pressable>
  );
}
