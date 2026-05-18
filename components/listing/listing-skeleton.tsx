import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PHOTO_SIZE = 90;

export function ListingCardHSkeleton() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={[styles.cardH, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
      <Skeleton width={PHOTO_SIZE} height={PHOTO_SIZE} radius={0} />
      <View style={styles.infoH}>
        <Skeleton width="75%" height={14} />
        <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
        <Skeleton width="55%" height={14} style={{ marginTop: 4 }} />
        <Skeleton width="38%" height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function ListingSkeleton() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
      {/* Image placeholder */}
      <Skeleton height={200} radius={0} />

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Skeleton width="65%" height={16} radius={Radius.sm} />
          <Skeleton width="28%" height={16} radius={Radius.sm} />
        </View>
        <Skeleton width="50%" height={13} radius={Radius.sm} style={{ marginTop: Spacing.xs }} />
        <View style={[styles.statsRow, { borderTopColor: C.outlineVariant }]}>
          <Skeleton width={52} height={13} radius={Radius.sm} />
          <Skeleton width={52} height={13} radius={Radius.sm} />
          <Skeleton width={60} height={13} radius={Radius.sm} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cardH: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    width: 280,
    ...Shadows.card,
  },
  infoH: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
});
