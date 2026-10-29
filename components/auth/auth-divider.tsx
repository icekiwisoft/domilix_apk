import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Horizontal rule with a short caption, between Google and the form. */
export function AuthDivider({ label }: { label: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: C.outlineVariant }]} />
      <Text style={[Typography.bodySm, styles.label, { color: C.onSurfaceVariant }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: C.outlineVariant }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md - Spacing.xs },
  line: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
  label: { flexShrink: 1, textAlign: 'center' },
});
