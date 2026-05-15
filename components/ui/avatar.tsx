import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = { sm: 32, md: 44, lg: 64 };

const initialsTypography: Record<AvatarSize, object> = {
  sm: Typography.caption,
  md: { ...Typography.bodyMd, fontWeight: '600' as const },
  lg: { ...Typography.headlineMd, fontSize: 24, lineHeight: 28 },
};

export function Avatar({ name, uri, size = 'md', style }: AvatarProps) {
  const bgColor = useThemeColor({}, 'primaryContainer');
  const textColor = useThemeColor({}, 'onPrimaryContainer');
  const dimension = sizeMap[size];

  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
    : '?';

  return (
    <View
      style={[
        styles.container,
        { width: dimension, height: dimension, borderRadius: dimension / 2, backgroundColor: bgColor },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
        />
      ) : (
        <Text style={[initialsTypography[size], { color: textColor }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
