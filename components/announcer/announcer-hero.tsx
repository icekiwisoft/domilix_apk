import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AnnouncerStats } from './announcer-stats';
import type { Announcer } from '@/types/announcer';

interface AnnouncerHeroProps {
  announcer: Announcer;
  announcesCount?: number;
  rating?: number;
  verified?: boolean;
  onContact?: () => void;
  onViewListings?: () => void;
}

export function AnnouncerHero({
  announcer,
  announcesCount = 0,
  rating,
  verified,
  onContact,
  onViewListings,
}: AnnouncerHeroProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const displayName = announcer.company_name ?? announcer.name;

  return (
    <View style={styles.root}>
      {/* Avatar with verified badge */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarWrapper, { borderColor: C.surface }]}>
          {announcer.avatar ? (
            <Image source={{ uri: announcer.avatar }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: C.surfaceVariant }]}>
              <MaterialIcons name="person" size={48} color={C.onSurfaceVariant} />
            </View>
          )}
        </View>
        {verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: C.surface }]}>
            <MaterialIcons name="verified" size={20} color={C.primary} />
          </View>
        )}
      </View>

      {/* Identity */}
      <Text style={[Typography.headlineMd, styles.name, { color: C.onSurface }]}>
        {displayName}
      </Text>
      {announcer.bio && (
        <Text style={[Typography.bodyLg, styles.bio, { color: C.onSurfaceVariant }]}>
          {announcer.bio}
        </Text>
      )}

      {/* Stats */}
      <View style={styles.statsWrapper}>
        <AnnouncerStats
          announcesCount={announcesCount}
          rating={rating}
          memberSince={announcer.creation_date}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={onContact}
          style={[styles.btn, styles.btnOutline, { borderColor: C.primary }]}
        >
          <MaterialIcons name="chat" size={18} color={C.primary} />
          <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
            Contacter
          </Text>
        </Pressable>
        <Pressable
          onPress={onViewListings}
          style={[styles.btn, styles.btnPrimary, { backgroundColor: C.primary }]}
        >
          <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
            Voir les annonces
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.marginMobile,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatarWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: Radius.full,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  bio: {
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: Spacing.xl,
  },
  statsWrapper: {
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  btnOutline: {
    borderWidth: 1.5,
  },
  btnPrimary: {},
});
