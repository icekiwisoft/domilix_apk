import { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe, useLogout } from '@/hooks/queries/use-auth-queries';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { useSubscriptions } from '@/hooks/queries/use-subscriptions';
import { useAuthStore } from '@/stores/auth.store';
import { LoginGate } from '@/components/ui/login-gate';
import { isAnnouncerToken } from '@/lib/decode-token';
import { isPackUsable } from '@/lib/subscription-helpers';

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
  const iconBg = destructive ? C.errorContainer + '55' : C.primaryFixed + '88';
  const iconColor = destructive ? C.error : C.primary;
  return (
    <TouchableRipple
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.menuRow, { borderBottomColor: C.outlineVariant + '44' }]}
    >
      <View style={styles.menuRowContent}>
        <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={19} color={iconColor} />
        </View>
        <View style={styles.menuText}>
          <Text style={[Typography.bodyMd, { color: destructive ? C.error : C.onSurface, fontFamily: 'PlusJakartaSans_500Medium' }]}>
            {label}
          </Text>
          {subtitle && (
            <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 1 }]}>{subtitle}</Text>
          )}
        </View>
        {!destructive && (
          <MaterialIcons name="chevron-right" size={18} color={C.outlineVariant} />
        )}
      </View>
    </TouchableRipple>
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user } = useMe();
  const { data: announcer } = useAnnouncer(user?.announcer ?? '');
  const logout = useLogout();
  const { data: subs = [] } = useSubscriptions();
  const activePacks = subs.filter(isPackUsable);
  const activePlanLabel = activePacks.length > 0
    ? `${activePacks.length} pack${activePacks.length > 1 ? 's' : ''} actif${activePacks.length > 1 ? 's' : ''}`
    : null;
  const isAnnouncer = isAnnouncerToken(accessToken) || !!user?.is_announcer || !!user?.announcer;
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  if (!accessToken) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <LoginGate
          title="Votre espace personnel"
          subtitle="Connectez-vous pour gérer votre profil, vos annonces et vos abonnements."
        />
      </SafeAreaView>
    );
  }

  function confirmLogout() {
    setLogoutDialogVisible(false);
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
            accessibilityRole="button"
            accessibilityLabel="Modifier le profil"
            onPress={() => router.push('/profile/edit')}
            style={[styles.editBtn, { backgroundColor: C.surface + 'CC', borderColor: C.outlineVariant }]}
          >
            <MaterialIcons name="edit" size={18} color={C.onSurface} />
          </Pressable>

          {/* Avatar */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Modifier la photo de profil"
            onPress={() => router.push('/profile/edit')}
            style={[styles.avatarWrapper, { borderColor: C.primary + '40' }]}
          >
            {announcer?.avatar ? (
              <Image source={{ uri: announcer.avatar }} style={styles.avatarImg} />
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

          {activePlanLabel && (
            <View style={[styles.announcerBadge, { backgroundColor: C.primaryFixed + 'AA', borderColor: C.primary + '30' }]}>
              <MaterialIcons name="workspace-premium" size={14} color={C.primary} />
              <Text style={[Typography.caption, { color: C.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
                {activePlanLabel}
              </Text>
            </View>
          )}
          {isAnnouncer && (
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
              {user?.credits ?? 0} crédits
            </Text>
            <Button
              mode="contained"
              compact
              onPress={() => router.push('/profile/subscriptions')}
            >
              Recharger
            </Button>
          </View>
        </View>

        {/* Activities */}
        <MenuSection title="Activité">
          <MenuRow
            icon="favorite-border"
            label="Mes favoris"
            onPress={() => router.push('/(tabs)/favorites')}
          />
        </MenuSection>

        {isAnnouncer && (
          <MenuSection title="Annonceur">
            <MenuRow
              icon="home-work"
              label="Mes annonces"
              subtitle="Gérer vos publications"
              onPress={() => router.push('/profile/my-listings')}
            />
            <MenuRow
              icon="storefront"
              label="Profil annonceur"
              subtitle="Modifier vos informations"
              onPress={() => router.push('/profile/announcer-profile')}
            />
            <MenuRow
              icon="add-circle-outline"
              label="Publier une annonce"
              subtitle="Mettre en ligne un bien ou un meuble"
              onPress={() => router.push('/announces/create/step-1')}
            />
          </MenuSection>
        )}

        {/* Account */}
        <MenuSection title="Compte">
          <MenuRow
            icon="workspace-premium"
            label="Mes packs Domicoin"
            subtitle={activePlanLabel ?? 'Découvrir les packs'}
            onPress={() => router.push('/profile/subscriptions')}
          />
          {!isAnnouncer && (
            <MenuRow
              icon="add-business"
              label="Devenir annonceur"
              onPress={() => router.push('/profile/announcer-profile')}
            />
          )}
          <MenuRow
            icon="settings"
            label="Paramètres"
            onPress={() => router.push('/profile/settings')}
          />
          <MenuRow
            icon="privacy-tip"
            label="Politique de confidentialité"
            onPress={() => Linking.openURL('https://domilix.com/privacy-policy')}
          />
        </MenuSection>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: Spacing.xxl }]}>
          <View style={[styles.sectionCard, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
            <MenuRow
              icon="logout"
              label="Se déconnecter"
              destructive
              onPress={() => setLogoutDialogVisible(true)}
            />
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Se déconnecter</Dialog.Title>
          <Dialog.Content>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              Voulez-vous vraiment vous déconnecter de votre compte ?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={() => setLogoutDialogVisible(false)}>Annuler</Button>
            <Button mode="text" textColor={C.error} onPress={confirmLogout}>Se déconnecter</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    borderRadius: 0,
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
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    width: '100%',
    ...Shadows.xs,
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
    borderBottomWidth: 1,
  },
  menuRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuText: { flex: 1 },
});
