import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Announcer } from '@/types/announcer';

interface AnnouncerCardProps {
  announcer: Announcer;
  announcesCount?: number;
  onPress?: () => void;
}

export function AnnouncerCard({ announcer, announcesCount, onPress }: AnnouncerCardProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const displayName = announcer.company_name ?? announcer.name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: C.surfaceContainer,
          borderColor: C.outlineVariant + '4D',
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatarWrapper, { borderColor: C.surface }]}>
        {announcer.avatar ? (
          <Image source={{ uri: announcer.avatar }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: C.surfaceVariant }]}>
            <MaterialIcons name="person" size={32} color={C.onSurfaceVariant} />
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={[Typography.bodyLg, styles.name, { color: C.onSurface }]} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.verifiedRow}>
          <MaterialIcons name="verified" size={16} color={C.secondary} />
          <Text style={[Typography.bodyMd, { color: C.secondary, fontSize: 13 }]}>Agence certifiée</Text>
        </View>
        {announcesCount != null && (
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 2 }]}>
            {announcesCount} annonces actives
          </Text>
        )}
      </View>

      {/* Chevron */}
      <View style={[styles.chevronCircle, { borderColor: C.outlineVariant + '80' }]}>
        <MaterialIcons name="chevron-right" size={20} color={C.onSurfaceVariant} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    lineHeight: 22,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  chevronCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
