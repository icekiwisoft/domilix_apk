import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

interface NotifGroupProps {
  title: string;
}

/** Day heading of the notification list ("Aujourd'hui", "Hier"), sticky. */
export function NotifGroup({ title }: NotifGroupProps) {
  const C = useThemeColors();
  return (
    <View
      style={{
        paddingHorizontal: Spacing.marginMobile,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
        backgroundColor: C.background,
      }}
    >
      <AppText variant="label" color="onSurfaceVariant" accessibilityRole="header">
        {title}
      </AppText>
    </View>
  );
}
