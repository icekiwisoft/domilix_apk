import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, type PressableProps } from 'react-native';

import { Opacity, Radii, Sizes, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

export type IconName = keyof typeof MaterialIcons.glyphMap;

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  /** Read by TalkBack: an icon-only button always needs one. */
  label: string;
  color?: ColorToken;
  /** Filled circle behind the icon (e.g. over a photo or in a sheet). */
  background?: ColorToken;
}

/** Round 48 dp icon button with a TalkBack label. */
export function IconButton({ icon, label, color = 'onSurface', background, disabled, ...rest }: IconButtonProps) {
  const C = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      android_ripple={{ color: C.ripple, borderless: !background }}
      style={({ pressed }) => [
        {
          width: Sizes.touchTarget,
          height: Sizes.touchTarget,
          borderRadius: Radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: background ? 'hidden' : 'visible',
          backgroundColor: background ? C[background] : 'transparent',
          opacity: disabled ? Opacity.disabled : 1,
        },
        pressed && process.env.EXPO_OS === 'ios' ? { opacity: Opacity.pressed } : null,
      ]}
      {...rest}
    >
      <MaterialIcons name={icon} size={Sizes.iconLg} color={C[color]} />
    </Pressable>
  );
}
