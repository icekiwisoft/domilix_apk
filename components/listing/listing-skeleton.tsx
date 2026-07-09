import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PHOTO_SIZE = 90;
const MANAGE_THUMB_SIZE = 104;

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

// Full-width skeleton matching ManageCard (app/profile/my-listings.tsx)
// exactly — same thumb size, badge row, and action bar height — so the
// loading→data swap doesn't reflow the list.
export function ManageCardSkeleton() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={[styles.manageCard, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant + '66' }]}>
      <View style={styles.manageCardBody}>
        <Skeleton width={MANAGE_THUMB_SIZE} height={MANAGE_THUMB_SIZE} radius={Radius.md} />
        <View style={styles.manageCardInfo}>
          <View style={styles.manageCardBadgeRow}>
            <Skeleton width={64} height={18} radius={Radius.full} />
            <Skeleton width={80} height={18} radius={Radius.full} />
          </View>
          <Skeleton width="85%" height={15} style={{ marginTop: 8 }} />
          <Skeleton width="55%" height={12} style={{ marginTop: 6 }} />
          <Skeleton width="35%" height={20} style={{ marginTop: 8 }} />
          <View style={styles.manageCardBadgeRow}>
            <Skeleton width={48} height={16} radius={Radius.full} />
            <Skeleton width={72} height={16} radius={Radius.full} />
          </View>
        </View>
      </View>
      <View style={[styles.manageCardActions, { borderTopColor: C.outlineVariant + '66' }]}>
        <Skeleton width="28%" height={14} />
        <Skeleton width="28%" height={14} />
        <Skeleton width="28%" height={14} />
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
  manageCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
  },
  manageCardBody: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm + 2,
  },
  manageCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  manageCardBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  manageCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
  },
});
