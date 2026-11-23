// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import type { ColorValue, StyleProp, TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // original
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // navigation
  'arrow.left': 'arrow-back',
  'arrow.right': 'arrow-forward',
  'xmark': 'close',
  'checkmark': 'check',
  'plus': 'add',
  // tabs
  'magnifyingglass': 'search',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'bell': 'notifications-none',
  'bell.fill': 'notifications',
  'person.crop.circle': 'person-outline',
  'person.crop.circle.fill': 'person',
  // home & search
  'location.fill': 'location-on',
  'tune': 'tune',
  'map': 'map',
  'list.bullet': 'list',
  'slider.horizontal.3': 'tune',
  // listing
  'bed.double': 'bed',
  'shower': 'shower',
  'square.and.arrow.up': 'share',
  'lock.fill': 'lock',
  'lock.open.fill': 'lock-open',
  // misc
  'star.fill': 'star',
  'trash': 'delete',
  'refresh': 'refresh',
} satisfies Record<string, MaterialIconName>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color as ComponentProps<typeof MaterialIcons>["color"]} size={size} name={MAPPING[name]} style={style} />;
}
