import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Borders } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

/** Hairline separator (outlineVariant), hidden from TalkBack. */
export function Divider({ orientation = 'horizontal', style }: DividerProps) {
  const C = useThemeColors();
  const line: ViewStyle =
    orientation === 'vertical'
      ? { width: Borders.thin, alignSelf: 'stretch' }
      : { height: Borders.thin, alignSelf: 'stretch' };
  return (
    <View
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={[line, { backgroundColor: C.outlineVariant }, style]}
    />
  );
}
