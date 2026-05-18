import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ListingSkeleton } from '@/components/listing/listing-skeleton';

interface Props {
  onBack: () => void;
}

export function AnnouncerDetailSkeleton({ onBack }: Props) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
      {/* Back button */}
      <Pressable
        onPress={onBack}
        style={[styles.backBtn, { backgroundColor: C.surface + 'CC' }]}
      >
        <MaterialIcons name="arrow-back" size={22} color={C.onSurface} />
      </Pressable>

      {/* Hero section */}
      <View style={[styles.heroSection, { backgroundColor: C.surfaceContainerLow }]}>
        <View style={styles.heroContent}>
          <Skeleton width={88} height={88} radius={44} style={styles.avatarSkeleton} />
          <Skeleton width="48%" height={22} style={styles.nameSkeleton} />
          <Skeleton width="30%" height={13} style={styles.subSkeleton} />

          <View style={styles.statsRow}>
            {[1, 2, 3].map((k) => (
              <View key={k} style={styles.statBox}>
                <Skeleton width={36} height={20} />
                <Skeleton width={52} height={12} style={{ marginTop: 4 }} />
              </View>
            ))}
          </View>

          <View style={styles.contactRow}>
            <Skeleton width="44%" height={44} radius={Radius.md} />
            <Skeleton width="44%" height={44} radius={Radius.md} />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: C.outlineVariant }]}>
        <View style={styles.tabBtn}>
          <Skeleton width={72} height={13} radius={Radius.sm} />
        </View>
        <View style={styles.tabBtn}>
          <Skeleton width={72} height={13} radius={Radius.sm} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ListingSkeleton />
        <ListingSkeleton />
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    paddingTop: 56,
    paddingHorizontal: Spacing.marginMobile,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: 0,
  },
  avatarSkeleton: {
    alignSelf: 'center',
  },
  nameSkeleton: {
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  subSkeleton: {
    alignSelf: 'center',
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    width: '100%',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: Spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
});
