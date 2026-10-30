import { View } from 'react-native';

import { AppText, Divider } from '@/components/ui';
import { Spacing } from '@/constants/theme';

/** Horizontal rule with a short caption, between Google and the form. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.ms }}>
      <Divider style={{ flex: 1 }} />
      <AppText variant="bodySm" color="onSurfaceVariant" style={{ flexShrink: 1, textAlign: 'center' }}>
        {label}
      </AppText>
      <Divider style={{ flex: 1 }} />
    </View>
  );
}
