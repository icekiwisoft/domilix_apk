import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe, useLogout } from '@/hooks/queries/use-auth-queries';

interface MenuRowProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function MenuRow({ icon, label, subtitle, onPress, destructive }: MenuRowProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const color = destructive ? C.error : C.onSurfaceVariant;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuRow, { borderBottomColor: C.outlineVariant + '4D' }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: destructive ? C.errorContainer + '33' : C.surfaceContainerLow }]}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={[Typography.bodyMd, { color: destructive ? C.error : C.onSurface, fontFamily: 'PlusJakartaSans_500Medium' }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>{subtitle}</Text>
        )}
      </View>
      {!destructive && (
        <MaterialIcons name="chevron-right" size={20} color={C.onSurfaceVariant} />
      )}
    </Pressable>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={styles.section}>
      <Text style={[Typography.labelSm, styles.sectionTitle, { color: C.onSurfaceVariant }]}>
        {title}
      </Text>
      <View style={[styles.sectionCard, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
        {children}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { data: user } = useMe();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => router.replace('/(auth)'),
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amber hero */}
        <View style={[styles.hero, { backgroundColor: C.primaryContainer + '4D' }]}>
          {/* Edit button */}
          <Pressable
            onPress={() => router.push('/(tabs)/profile/edit')}
            style={[styles.editBtn, { backgroundColor: C.surface + 'CC', borderColor: C.outlineVariant }]}
          >
            <MaterialIcons name="edit" size={18} color={C.onSurface} />
          </Pressable>

          {/* Avatar */}
          <Pressable
            onPress={() => router.push('/(tabs)/profile/edit')}
            style={[styles.avatarWrapper, { borderColor: C.primary + '40' }]}
          >
            {user?.announcer?.avatar ? (
              <Image source={{ uri: user.announcer.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, styles.avatarFallback, { backgroundColor: C.surfaceContainerHighest }]}>
                <MaterialIcons name="person" size={44} color={C.onSurfaceVariant} />
              </View>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: C.primary }]}>
              <MaterialIcons name="photo-camera" size={12} color={C.onPrimary} />
            </View>
          </Pressable>

          <Text style={[Typography.headlineMd, { color: C.onSurface, marginTop: Spacing.md, fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center' }]}>
            {user?.name ?? '—'}
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: 2, textAlign: 'center' }]}>
            {user?.email ?? user?.phone_number ?? ''}
          </Text>

          {user?.is_announcer && (
            <View style={[styles.announcerBadge, { backgroundColor: C.primary + '15', borderColor: C.primary + '30' }]}>
              <MaterialIcons name="verified" size={14} color={C.primary} />
              <Text style={[Typography.caption, { color: C.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
                Annonceur certifié
              </Text>
            </View>
          )}

          {/* Credits */}
          <View style={[styles.creditsRow, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
            <MaterialIcons name="toll" size={18} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
              {user?.credits_count ?? 0} crédits
            </Text>
            <Pressable
              style={[styles.rechargeBtn, { backgroundColor: C.primary }]}
              onPress={() => router.push('/(tabs)/profile/subscriptions')}
            >
              <Text style={[Typography.caption, { color: C.onPrimary, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
                Recharger
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Activities */}
        <MenuSection title="Activité">
          <MenuRow
            icon="home-work"
            label="Mes annonces"
            subtitle="Gérer vos publications"
            onPress={() => router.push('/(tabs)/explore')}
          />
          <MenuRow
            icon="favorite-border"
            label="Mes favoris"
            onPress={() => router.push('/(tabs)/favorites')}
          />
        </MenuSection>

        {/* Account */}
        <MenuSection title="Compte">
          <MenuRow
            icon="workspace-premium"
            label="Mon abonnement"
            subtitle="Plan Pro actif"
            onPress={() => router.push('/(tabs)/profile/subscriptions')}
          />
          {user?.is_announcer ? (
            <MenuRow
              icon="storefront"
              label="Profil annonceur"
              subtitle="Modifier vos informations"
              onPress={() => router.push('/(tabs)/profile/announcer-profile')}
            />
          ) : (
            <MenuRow
              icon="add-business"
              label="Devenir annonceur"
              onPress={() => router.push('/(tabs)/profile/announcer-profile')}
            />
          )}
          <MenuRow
            icon="settings"
            label="Paramètres"
          />
          <MenuRow
            icon="help-outline"
            label="Aide & Support"
          />
        </MenuSection>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: Spacing.xxl }]}>
          <View style={[styles.sectionCard, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
            <MenuRow
              icon="logout"
              label="Se déconnecter"
              destructive
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {},
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.marginMobile,
  },
  editBtn: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.marginMobile,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    overflow: 'visible',
    position: 'relative',
  },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    width: '100%',
  },
  rechargeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  section: {
    paddingHorizontal: Spacing.marginMobile,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1.12,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1 },
});
