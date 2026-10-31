import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, View, useWindowDimensions } from 'react-native';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  Dialog,
  ErrorState,
  IconButton,
  ListRow,
  LoadingState,
  LoginGate,
  OfflineState,
  Screen,
  Section,
} from '@/components/ui';
import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useAnnouncer } from '@/hooks/queries/use-announcers';
import { useLogout, useMe } from '@/hooks/queries/use-auth-queries';
import { useSubscriptions } from '@/hooks/queries/use-subscriptions';
import { useAnnouncerRequest, useStudentVerification } from '@/hooks/queries/use-verification';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isAnnouncerToken } from '@/lib/decode-token';
import { formatDateFr } from '@/lib/format-date';
import { isNetworkError } from '@/lib/network-error';
import { isPackUsable } from '@/lib/subscription-helpers';
import { useAuthStore } from '@/stores/auth.store';

/**
 * fontScale from which the profile stacks what sits side by side (balance and
 * Recharger, avatar and name), so no word is cut in a narrow column (QA-12).
 */
const STACK_SCALE = 1.5;

function useStacked() {
  return useWindowDimensions().fontScale >= STACK_SCALE;
}

/** Domicoin balance on the dark promo surface (mockup Profil), with Recharger. */
function BalanceCard({ credits, onRecharge }: { credits: number; onRecharge: () => void }) {
  const C = useThemeColors();
  const stacked = useStacked();
  const recharge = <Button label="Recharger" onPress={onRecharge} fullWidth={stacked} />;
  return (
    <View style={{ gap: Spacing.ms, padding: Spacing.md, borderRadius: Radii.card, backgroundColor: C.promoSurface }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.ms }}>
        <View
          importantForAccessibility="no-hide-descendants"
          style={{
            width: Sizes.avatarMd,
            height: Sizes.avatarMd,
            borderRadius: Radii.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: C.cta,
          }}
        >
          <MaterialIcons name="toll" size={Sizes.iconLg} color={C.onCta} />
        </View>
        <View accessible style={{ flex: 1 }}>
          <AppText variant="caption" color="onPromoVariant">
            Votre solde
          </AppText>
          <AppText variant="headline" color="onPromo">
            {credits} Domicoin{credits > 1 ? 's' : ''}
          </AppText>
        </View>
        {stacked ? null : recharge}
      </View>
      {stacked ? recharge : null}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading, isError, error, refetch } = useMe();
  const { data: announcer } = useAnnouncer(user?.announcer ?? '');
  const logout = useLogout();
  const { data: subs = [] } = useSubscriptions();
  const activePacks = subs.filter(isPackUsable);
  const activePlanLabel =
    activePacks.length > 0
      ? `${activePacks.length} pack${activePacks.length > 1 ? 's' : ''} actif${activePacks.length > 1 ? 's' : ''}`
      : null;
  const isAnnouncer = isAnnouncerToken(accessToken) || !!user?.is_announcer || !!user?.announcer;
  // Same queries and status rules as the two verification screens (QA-31).
  const { data: announcerRequest } = useAnnouncerRequest();
  const { data: studentRequest } = useStudentVerification();
  const announcerSubtitle = user?.announcer_verified
    ? 'Profil vérifié'
    : announcerRequest?.status === 'pending'
      ? 'Demande en attente de vérification'
      : announcerRequest?.status === 'rejected'
        ? 'Demande refusée, vous pouvez la renvoyer'
        : 'Obtenir le badge annonceur vérifié';
  const studentSubtitle = !studentRequest
    ? 'Faire vérifier votre statut'
    : studentRequest.status === 'approved'
      ? studentRequest.is_currently_verified
        ? studentRequest.expires_at
          ? `Statut vérifié jusqu'au ${formatDateFr(studentRequest.expires_at)}`
          : 'Statut vérifié'
        : 'Statut expiré, à renouveler'
      : studentRequest.status === 'pending'
        ? 'Demande en attente de vérification'
        : studentRequest.status === 'rejected'
          ? 'Demande refusée, vous pouvez la renvoyer'
          : 'Faire vérifier votre statut';
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const stacked = useStacked();

  if (!accessToken) {
    return (
      <Screen bottomInset={false}>
        <LoginGate
          redirect="/(tabs)/profile"
          title="Votre espace personnel"
          subtitle="Connectez-vous pour gérer votre profil, vos annonces et vos packs Domicoin."
        />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen bottomInset={false}>
        {isError && isNetworkError(error) ? (
          <OfflineState onRetry={() => refetch()} />
        ) : isError ? (
          <ErrorState title="Impossible de charger votre profil" onRetry={() => refetch()} />
        ) : isLoading ? (
          <LoadingState label="Chargement du profil…" media={false} count={3} />
        ) : null}
      </Screen>
    );
  }

  function confirmLogout() {
    setLogoutDialogVisible(false);
    logout.mutate(undefined, {
      onSettled: () => router.replace('/(auth)'),
    });
  }

  const contact = user.email ?? user.phone_number ?? '';
  const identity = (
    // minWidth 0 / flexShrink: the column never grows past the page gutter, so the
    // ellipsized e-mail ends at the same margin as the other lines (N-2).
    <View style={{ flex: stacked ? undefined : 1, alignSelf: 'stretch', minWidth: 0, flexShrink: 1, gap: Spacing.xxs }}>
      <AppText variant="title" accessibilityRole="header">
        {user.name}
      </AppText>
      {contact ? (
        // An e-mail has no break points: one line with an ellipsis rather
        // than a cut in the middle of a word (QA-12); TalkBack reads it whole.
        <AppText color="onSurfaceVariant" numberOfLines={1} ellipsizeMode="middle" style={{ flexShrink: 1 }}>
          {contact}
        </AppText>
      ) : null}
      {activePlanLabel || isAnnouncer ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs }}>
          {activePlanLabel ? <Badge label={activePlanLabel} variant="primary" icon="workspace-premium" status /> : null}
          {isAnnouncer ? (
            user.announcer_verified ? (
              <Badge label="Annonceur certifié" variant="success" icon="verified" status />
            ) : (
              <Badge label="Annonceur" variant="primary" icon="storefront" status />
            )
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen bottomInset={false} contentStyle={{ gap: Spacing.lg }}>
      {/* Identity: at large font sizes the name block goes under the avatar row. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.ms }}>
        <Avatar size="lg" name={user.name} uri={announcer?.avatar ?? undefined} />
        {stacked ? <View style={{ flex: 1 }} /> : identity}
        <IconButton
          icon="edit"
          label="Modifier le profil"
          color="link"
          background="surfaceContainerLowest"
          onPress={() => router.push('/profile/edit')}
        />
      </View>
      {stacked ? identity : null}

      <BalanceCard credits={user.credits ?? 0} onRecharge={() => router.push('/profile/subscriptions')} />

      <Section title="Activité">
        <ListRow icon="favorite-border" title="Mes favoris" onPress={() => router.push('/(tabs)/favorites')} />
        <ListRow
          icon="notifications-none"
          title="Mes alertes"
          subtitle="Soyez averti des nouvelles annonces"
          onPress={() => router.push('/profile/alerts')}
        />
      </Section>

      {isAnnouncer ? (
        <Section title="Annonceur">
          <ListRow
            icon="home-work"
            title="Mes annonces"
            subtitle="Gérer vos publications"
            onPress={() => router.push('/profile/my-listings')}
          />
          <ListRow
            icon="storefront"
            title="Profil annonceur"
            subtitle="Modifier vos informations"
            onPress={() => router.push('/profile/announcer-profile')}
          />
          <ListRow
            icon="verified-user"
            title="Vérification du profil"
            subtitle={announcerSubtitle}
            onPress={() => router.push('/profile/become-announcer')}
          />
          <ListRow
            icon="add-circle-outline"
            title="Publier une annonce"
            subtitle="Mettre en ligne un bien ou un meuble"
            onPress={() => router.push('/announces/create/step-1')}
          />
        </Section>
      ) : null}

      <Section title="Compte">
        <ListRow
          icon="workspace-premium"
          title="Mes packs Domicoin"
          subtitle={activePlanLabel ?? 'Découvrir les packs'}
          onPress={() => router.push('/profile/subscriptions')}
        />
        {!isAnnouncer ? (
          <ListRow
            icon="add-business"
            title="Devenir annonceur"
            subtitle="Publiez vos biens sur Domilix"
            onPress={() => router.push('/profile/become-announcer')}
          />
        ) : null}
        <ListRow
          icon="school"
          title="Statut étudiant"
          subtitle={studentSubtitle}
          onPress={() => router.push('/profile/student-verification')}
        />
        <ListRow
          icon="settings"
          title="Paramètres"
          subtitle="Thème, mot de passe"
          onPress={() => router.push('/profile/settings')}
        />
        <ListRow
          icon="privacy-tip"
          title="Politique de confidentialité"
          onPress={() => Linking.openURL('https://domilix.com/privacy-policy')}
        />
      </Section>

      <Section>
        <ListRow
          icon="logout"
          title="Se déconnecter"
          destructive
          chevron={false}
          onPress={() => setLogoutDialogVisible(true)}
        />
      </Section>

      <Dialog
        visible={logoutDialogVisible}
        title="Se déconnecter"
        message="Voulez-vous vraiment vous déconnecter de votre compte ?"
        confirmLabel="Se déconnecter"
        danger
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialogVisible(false)}
      />
    </Screen>
  );
}
