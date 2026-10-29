import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Opacity, Radii, Sizes, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

export type IconName = keyof typeof MaterialIcons.glyphMap;

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  /** Read by TalkBack: an icon-only button always needs one. */
  label: string;
  color?: ColorToken;
  /** Filled circle behind the icon (e.g. in a sheet). */
  background?: ColorToken;
  /**
   * Over a photo: light chip in both themes (bannerChip) with a dark icon,
   * readable whatever the image (onBannerChip 15:1 on the chip).
   */
  overlay?: boolean;
  /**
   * Toggle state (favourite, etc.): TalkBack reads "sélectionné". Shown by the
   * icon shape (`selectedIcon`, e.g. favorite vs favorite-border) as well as
   * its colour.
   */
  selected?: boolean;
  selectedIcon?: IconName;
  /** Icon colour when selected; default `link`, or a red accent on `overlay`. */
  selectedColor?: ColorToken;
  /** Container style (position over a photo, margins). */
  style?: StyleProp<ViewStyle>;
}

/** Round 48 dp icon button with a TalkBack label. */
export function IconButton({
  icon,
  label,
  color,
  background,
  overlay = false,
  selected,
  selectedIcon,
  selectedColor,
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  const C = useThemeColors();
  const bg: ColorToken | undefined = overlay ? 'bannerChip' : background;
  const restColor: ColorToken = color ?? (overlay ? 'onBannerChip' : 'onSurface');
  // onBannerChipAccent on the light chip 5.7:1; link on the page 6.1:1 (light), 10:1 (dark).
  const onColor: ColorToken = selectedColor ?? (overlay ? 'onBannerChipAccent' : 'link');
  const fg = selected ? onColor : restColor;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected }}
      disabled={disabled}
      android_ripple={{ color: C.ripple, borderless: !bg }}
      style={({ pressed }) => [
        {
          width: Sizes.touchTarget,
          height: Sizes.touchTarget,
          borderRadius: Radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: bg ? 'hidden' : 'visible',
          backgroundColor: bg ? C[bg] : 'transparent',
          opacity: disabled ? Opacity.disabled : 1,
        },
        pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
        style,
      ]}
      {...rest}
    >
      <MaterialIcons name={selected && selectedIcon ? selectedIcon : icon} size={Sizes.iconLg} color={C[fg]} />
    </Pressable>
  );
}
