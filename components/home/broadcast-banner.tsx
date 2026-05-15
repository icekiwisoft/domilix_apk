import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Broadcast } from '@/types/announce';

interface BroadcastBannerProps {
  broadcast: Broadcast;
  onPress?: () => void;
}

export function BroadcastBanner({ broadcast, onPress }: BroadcastBannerProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: C.primary, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      {/* Decorative orbs */}
      <View style={[styles.orb, styles.orbTopRight, { backgroundColor: '#ffffff0D' }]} />
      <View style={[styles.orb, styles.orbBottomLeft, { backgroundColor: '#00000019' }]} />

      {/* Content */}
      <View style={styles.content}>
        {broadcast.badge && (
          <View style={[styles.badgePill, { backgroundColor: C.inversePrimary }]}>
            <Text style={[Typography.labelSm, { color: C.primaryFixed, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
              {broadcast.badge}
            </Text>
          </View>
        )}
        <Text style={[Typography.headlineMd, styles.title, { color: C.onPrimary }]}>
          {broadcast.title}
        </Text>
        {broadcast.subtitle && (
          <Text style={[Typography.bodyMd, { color: C.onPrimary, opacity: 0.9, marginTop: 4 }]}>
            {broadcast.subtitle}
          </Text>
        )}
      </View>

      {/* CTA */}
      {broadcast.cta && (
        <View style={[styles.cta, { backgroundColor: C.inversePrimary }]}>
          <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
            {broadcast.cta}
          </Text>
          <MaterialIcons name="arrow-forward" size={14} color={C.primary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    overflow: 'hidden',
    gap: Spacing.lg,
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  orb: {
    position: 'absolute',
    borderRadius: Radius.full,
  },
  orbTopRight: {
    width: 160,
    height: 160,
    top: -40,
    right: -40,
  },
  orbBottomLeft: {
    width: 120,
    height: 120,
    bottom: -40,
    left: '25%',
  },
  content: {
    gap: Spacing.sm,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#ffffff',
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
});
