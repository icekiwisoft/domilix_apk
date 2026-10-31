import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Radii, Sizes, Typography, type TextVariant } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name?: string;
  uri?: string;
  size?: AvatarSize;
  /** Shown when there is neither a photo nor a name (instead of "?"). */
  fallbackIcon?: IconName;
  style?: StyleProp<ViewStyle>;
}

const DIMENSION: Record<AvatarSize, number> = { sm: Sizes.avatarSm, md: Sizes.avatarMd, lg: Sizes.avatarLg };
/** Largest font scale of the initials: "WW" fits the sm, md and lg circles. */
const INITIALS_MAX_SCALE = 1.3;
const INITIALS: Record<AvatarSize, TextVariant> = { sm: 'caption', md: 'bodyStrong', lg: 'headline' };

/**
 * Round photo, or the initials on primaryContainer (white 6.45:1 light,
 * peach 4.98:1 dark). Read by TalkBack as the name when one is given.
 */
export function Avatar({ name, uri, size = 'md', fallbackIcon = 'person', style }: AvatarProps) {
  const C = useThemeColors();
  const dimension = DIMENSION[size];
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View
      accessible={!!name}
      accessibilityRole={name ? 'image' : undefined}
      accessibilityLabel={name}
      importantForAccessibility={name ? 'yes' : 'no-hide-descendants'}
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: Radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: C.primaryContainer,
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: dimension, height: dimension }} contentFit="cover" />
      ) : !initials ? (
        <MaterialIcons name={fallbackIcon} size={dimension / 2} color={C.onPrimaryContainer} />
      ) : (
        <AppText
          variant={INITIALS[size]}
          color="onPrimaryContainer"
          // The initials must fit the fixed circle: at 2.0 "NW" was clipped
          // (QA-12, UI-10). They are decorative (the avatar is read as the
          // name, which is written next to it at full size), so their growth
          // is capped where two wide capitals still fit every size.
          maxFontSizeMultiplier={INITIALS_MAX_SCALE}
          style={size === 'lg' ? Typography.headlineSm : undefined}
        >
          {initials}
        </AppText>
      )}
    </View>
  );
}
