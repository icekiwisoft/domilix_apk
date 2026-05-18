import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface NotifGroupProps {
  title: string;
}

export function NotifGroup({ title }: NotifGroupProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={[styles.wrapper, { backgroundColor: C.surfaceContainerHighest }]}>
      <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.sm,
  },
});
