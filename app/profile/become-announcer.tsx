import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { DocumentPickerField } from '@/components/forms/document-picker-field';
import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  ErrorState,
  Field,
  LoadingState,
  LoginGate,
  OfflineState,
  Screen,
  ScreenHeader,
  useToast,
  type BadgeVariant,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useBecomeAnnouncer, useMe } from '@/hooks/queries/use-auth-queries';
import { useAnnouncerRequest, useSubmitAnnouncerVerification } from '@/hooks/queries/use-verification';
import { getApiErrorMessage } from '@/lib/api-error';
import { isAnnouncerToken } from '@/lib/decode-token';
import { formatDateFr } from '@/lib/format-date';
import { isNetworkError } from '@/lib/network-error';
import type { PickedFile } from '@/services/uploads.service';
import { useAuthStore } from '@/stores/auth.store';

type DisplayStatus = 'none' | 'pending' | 'approved' | 'rejected';

const STATUS: Record<DisplayStatus, { label: string; variant: BadgeVariant }> = {
  none: { label: 'Compte annonceur non vérifié', variant: 'neutral' },
  pending: { label: 'Demande en attente de vérification', variant: 'primary' },
  approved: { label: 'Compte annonceur vérifié', variant: 'success' },
  rejected: { label: 'Demande refusée', variant: 'error' },
};

export default function BecomeAnnouncerScreen() {
  const router = useRouter();
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading: userLoading, isError: userError, error: userErr, refetch: refetchUser } = useMe();
  const {
    data: request,
    isLoading: requestLoading,
    isError: requestError,
    refetch: refetchRequest,
  } = useAnnouncerRequest();
  const becomeAnnouncer = useBecomeAnnouncer();
  const submitVerification = useSubmitAnnouncerVerification();

  const [formOpen, setFormOpen] = useState(false);
  const [document, setDocument] = useState<PickedFile | null>(null);
  const [phone, setPhone] = useState('');

  const isAnnouncer = isAnnouncerToken(accessToken) || !!user?.is_announcer || !!user?.announcer;
  const status: DisplayStatus = user?.announcer_verified
    ? 'approved'
    : ((request?.status as DisplayStatus | undefined) ?? 'none');
  const canStartVerification = isAnnouncer && status !== 'approved' && status !== 'pending';

  function handleActivate() {
    becomeAnnouncer.mutate(undefined, {
      onSuccess: () => toast.show('Votre compte annonceur est activé.', 'success'),
      onError: (err) => toast.show(getApiErrorMessage(err, "Impossible d'activer votre compte annonceur."), 'error'),
    });
  }

  function handleSubmitVerification() {
    if (!document) {
      toast.show('Veuillez ajouter une photo de votre CNI.', 'error');
      return;
    }
    submitVerification.mutate(
      { document, contactPhone: phone.trim() || undefined },
      {
        onSuccess: () => {
          toast.show('Demande envoyée avec succès', 'success');
          setFormOpen(false);
          setDocument(null);
        },
        onError: (err) => toast.show(getApiErrorMessage(err, 'Erreur lors de la demande'), 'error'),
      }
    );
  }

  const header = <ScreenHeader title="Devenir annonceur" />;

  if (!accessToken) {
    return (
      <Screen header={header}>
        <LoginGate
          title="Devenir annonceur"
          subtitle="Connectez-vous pour activer votre profil annonceur et publier vos annonces."
          redirect="/profile/become-announcer"
        />
      </Screen>
    );
  }

  if (userLoading && !isAnnouncer) {
    return (
      <Screen header={header}>
        <LoadingState label="Chargement de votre compte…" media={false} count={2} />
      </Screen>
    );
  }

  // GET /auth/me is the screen's main query: without it, it cannot tell whether the account is an announcer.
  if (!user && !isAnnouncer && userError) {
    return (
      <Screen header={header} contentStyle={{ flexGrow: 1 }}>
        {isNetworkError(userErr) ? (
          <OfflineState onRetry={() => refetchUser()} />
        ) : (
          <ErrorState title="Impossible de charger votre compte" onRetry={() => refetchUser()} />
        )}
      </Screen>
    );
  }

  return (
    <Screen keyboard header={header} contentStyle={{ gap: Spacing.lg }}>
      {!isAnnouncer ? (
        <Card surface="primaryFixed" style={{ gap: Spacing.md }}>
          <AppText variant="title" color="onPrimaryFixed" accessibilityRole="header">
            Activez votre profil annonceur
          </AppText>
          <AppText color="onPrimaryFixed">
            {"Créez votre espace annonceur pour publier vos annonces. La vérification d'identité pourra être demandée ensuite."}
          </AppText>
          <Button
            label="Devenir annonceur"
            icon="storefront"
            size="lg"
            fullWidth
            loading={becomeAnnouncer.isPending}
            onPress={handleActivate}
          />
        </Card>
      ) : (
        <>
          <Banner tone="success" icon="check-circle">
            Compte annonceur actif
          </Banner>

          <Card surface="surfaceContainerLowest" outlined style={{ gap: Spacing.md }}>
            <AppText variant="title" accessibilityRole="header">
              Vérification du profil
            </AppText>
            <AppText color="onSurfaceVariant">
              {"Envoyez une photo de votre CNI afin que l'équipe Domilix puisse vérifier votre identité avant validation."}
            </AppText>

            {requestLoading ? (
              <AppText variant="caption" color="onSurfaceVariant">
                Chargement du statut…
              </AppText>
            ) : requestError && !user?.announcer_verified ? (
              <Banner
                tone="error"
                action={
                  <Button
                    variant="text"
                    icon="refresh"
                    label="Réessayer"
                    onPress={() => refetchRequest()}
                    style={{ alignSelf: 'flex-start' }}
                  />
                }
              >
                Impossible de charger le statut de votre demande.
              </Banner>
            ) : (
              <Badge
                label={STATUS[status].label}
                variant={STATUS[status].variant}
                status
                style={{ alignSelf: 'flex-start' }}
              />
            )}
            {!!request?.created_at && status !== 'approved' ? (
              <AppText variant="caption" color="onSurfaceVariant">
                {`Demande envoyée le ${formatDateFr(request.created_at)}`}
              </AppText>
            ) : null}

            {canStartVerification && !requestError && !formOpen ? (
              <Button
                label={status === 'rejected' ? 'Renvoyer une vérification' : 'Démarrer une vérification'}
                size="lg"
                fullWidth
                onPress={() => setFormOpen(true)}
              />
            ) : null}

            {canStartVerification && formOpen ? (
              <View style={{ gap: Spacing.md }}>
                <DocumentPickerField
                  label="Photo de votre CNI"
                  value={document}
                  onChange={setDocument}
                  disabled={submitVerification.isPending}
                />
                <Field
                  label="Numéro de téléphone de contact"
                  labelHint="(facultatif)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  placeholder="+237 6XX XX XX XX"
                />
                <AppText variant="caption" color="onSurfaceVariant">
                  {"Avant d'envoyer, vérifiez que vos coordonnées sont correctes et que vous êtes inscrit avec une adresse e-mail ou un numéro de téléphone joignable."}
                </AppText>
                <Button
                  label="Envoyer la vérification"
                  icon="send"
                  size="lg"
                  fullWidth
                  loading={submitVerification.isPending}
                  onPress={handleSubmitVerification}
                />
              </View>
            ) : null}
          </Card>

          <Button
            variant="secondary"
            icon="storefront"
            label="Modifier mon profil annonceur"
            size="lg"
            fullWidth
            onPress={() => router.push('/profile/announcer-profile')}
          />
        </>
      )}
    </Screen>
  );
}
