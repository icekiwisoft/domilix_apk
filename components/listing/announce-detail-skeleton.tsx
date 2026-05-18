import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  onBack: () => void;
}

export function AnnounceDetailSkeleton({ onBack }: Props) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={false}>
      {/* Hero */}
      <View style={{ position: 'relative' }}>
        <Skeleton height={300} radius={0} />
        <Pressable
          onPress={onBack}
          style={[styles.fabBtn, styles.backBtn, { backgroundColor: C.surface + 'CC' }]}
        >
          <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Badge */}
        <Skeleton width={84} height={26} radius={Radius.full} />

        {/* Title */}
        <View style={{ gap: Spacing.xs }}>
          <Skeleton width="90%" height={26} />
          <Skeleton width="60%" height={26} />
        </View>

        {/* Address */}
        <Skeleton width="65%" height={14} />

        {/* Price box */}
        <View style={[styles.priceBox, { borderColor: C.outlineVariant }]}>
          <Skeleton width="38%" height={12} />
          <Skeleton width="55%" height={22} style={{ marginTop: Spacing.xs }} />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Skeleton width={72} height={14} radius={Radius.sm} />
          <Skeleton width={72} height={14} radius={Radius.sm} />
          <Skeleton width={72} height={14} radius={Radius.sm} />
        </View>

        <View style={[styles.divider, { backgroundColor: C.outlineVariant + '4D' }]} />

        {/* Description */}
        <Skeleton width="55%" height={20} />
        <View style={{ gap: Spacing.sm }}>
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} width={k === 4 ? '70%' : '100%'} height={14} />
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: C.outlineVariant + '4D' }]} />

        {/* Amenities */}
        <Skeleton width="62%" height={20} />
        <View style={styles.amenGrid}>
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <Skeleton key={k} width="30%" height={46} radius={Radius.md} />
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: C.outlineVariant + '4D' }]} />

        {/* Announcer card */}
        <Skeleton width="38%" height={12} />
        <View style={[styles.announcerCard, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
          <Skeleton width={48} height={48} radius={Radius.full} />
          <View style={{ flex: 1, gap: Spacing.xs }}>
            <Skeleton width="52%" height={16} />
            <Skeleton width="38%" height={12} />
          </View>
        </View>
      </View>

      <View style={{ height: 96 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {},
  fabBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    top: Spacing.md,
    left: Spacing.md,
  },
  body: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  priceBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  divider: {
    height: 1,
  },
  amenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  announcerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
