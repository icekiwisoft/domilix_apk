import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function NotifSkeleton() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={[styles.row, { borderBottomColor: C.outlineVariant }]}>
      <Skeleton width={40} height={40} radius={Radius.full} />
      <View style={styles.body}>
        <Skeleton width="78%" height={14} />
        <Skeleton width="52%" height={12} style={{ marginTop: 5 }} />
      </View>
      <Skeleton width={32} height={11} radius={Radius.sm} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  body: {
    flex: 1,
    gap: 5,
  },
});
