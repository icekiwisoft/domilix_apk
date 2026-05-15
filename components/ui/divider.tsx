import { View, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export function Divider({ orientation = 'horizontal', style }: DividerProps) {
  const color = useThemeColor({}, 'outlineVariant');

  if (orientation === 'vertical') {
    return <View style={[{ width: 1, backgroundColor: color, alignSelf: 'stretch' }, style]} />;
  }

  return <View style={[{ height: 1, backgroundColor: color, width: '100%' }, style]} />;
}
