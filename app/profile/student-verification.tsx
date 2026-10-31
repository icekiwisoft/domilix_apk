import { useState } from 'react';
import { View } from 'react-native';

import { DocumentPickerField } from '@/components/forms/document-picker-field';
import {
  AppText,
  Badge,
  Button,
  Card,
  ErrorState,
  LoadingState,
  LoginGate,
  OfflineState,
  Screen,
  ScreenHeader,
  useToast,
  type BadgeVariant,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useStudentVerification, useSubmitStudentVerification } from '@/hooks/queries/use-verification';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatDateFr } from '@/lib/format-date';
import { isNetworkError } from '@/lib/network-error';
import type { PickedFile } from '@/services/uploads.service';
import { useAuthStore } from '@/stores/auth.store';

type DisplayStatus = 'none' | 'pending' | 'approved' | 'expired' | 'rejected';

const STATUS: Record<DisplayStatus, { label: string; variant: BadgeVariant }> = {
  none: { label: 'Statut étudiant non vérifié', variant: 'neutral' },
  pending: { label: 'Demande en attente de vérification', variant: 'primary' },
  approved: { label: 'Statut étudiant vérifié', variant: 'success' },
  expired: { label: 'Statut étudiant expiré', variant: 'error' },
  rejected: { label: 'Demande refusée', variant: 'error' },
};

export default function StudentVerificationScreen() {
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: request, isLoading, isError, error, refetch } = useStudentVerification();
  const submit = useSubmitStudentVerification();

  const [formOpen, setFormOpen] = useState(false);
  const [studentId, setStudentId] = useState<PickedFile | null>(null);
  const [receipt, setReceipt] = useState<PickedFile | null>(null);

  // "Verified" is always derived from the expiry date by the API, never from
  // a stored flag: a student status can never stay permanent.
  const status: DisplayStatus = !request
    ? 'none'
    : request.status === 'approved'
      ? request.is_currently_verified
        ? 'approved'
        : 'expired'
      : (request.status as DisplayStatus);
  const canStart = status !== 'pending';

  function handleSubmit() {
    if (!studentId || !receipt) {
      toast.show('Veuillez ajouter votre carte étudiante et un reçu.', 'error');
      return;
    }
    submit.mutate(
      { studentId, receipt },
      {
        onSuccess: () => {
          toast.show('Demande envoyée avec succès', 'success');
          setFormOpen(false);
          setStudentId(null);
          setReceipt(null);
        },
        onError: (err) => toast.show(getApiErrorMessage(err, 'Erreur lors de la demande'), 'error'),
      }
    );
  }

  const header = <ScreenHeader title="Statut étudiant" />;

  if (!accessToken) {
    return (
      <Screen header={header}>
        <LoginGate
          title="Statut étudiant"
          subtitle="Connectez-vous pour déclarer votre statut étudiant."
          redirect="/profile/student-verification"
        />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen header={header}>
        <LoadingState label="Chargement de votre statut…" media={false} count={1} />
      </Screen>
    );
  }

  // Without GET /student-verification/me the screen cannot tell whether a request is pending.
  if (isError) {
    return (
      <Screen header={header} contentStyle={{ flexGrow: 1 }}>
        {isNetworkError(error) ? (
          <OfflineState onRetry={() => refetch()} />
        ) : (
          <ErrorState title="Impossible de charger votre statut étudiant" onRetry={() => refetch()} />
        )}
      </Screen>
    );
  }

  return (
    <Screen header={header} contentStyle={{ gap: Spacing.lg }}>
      <Card surface="surfaceContainerLowest" outlined style={{ gap: Spacing.md }}>
        <AppText color="onSurfaceVariant">
          {"Déclarez votre statut étudiant en envoyant votre carte étudiante et un reçu (preuve d'inscription ou de paiement). Ce statut est valable 1 an, après quoi une nouvelle vérification sera nécessaire."}
        </AppText>

        <Badge label={STATUS[status].label} variant={STATUS[status].variant} status style={{ alignSelf: 'flex-start' }} />

        {status === 'approved' && !!request?.expires_at ? (
          <AppText variant="caption" color="onSurfaceVariant">
            {`Valable jusqu'au ${formatDateFr(request.expires_at)}`}
          </AppText>
        ) : null}
        {status !== 'approved' && !!request?.created_at ? (
          <AppText variant="caption" color="onSurfaceVariant">
            {`Demande envoyée le ${formatDateFr(request.created_at)}`}
          </AppText>
        ) : null}

        {canStart && !formOpen ? (
          <Button
            size="lg"
            fullWidth
            label={
              status === 'rejected' || status === 'expired'
                ? 'Renvoyer une vérification'
                : status === 'approved'
                  ? 'Renouveler la vérification'
                  : 'Vérifier mon statut étudiant'
            }
            onPress={() => setFormOpen(true)}
          />
        ) : null}

        {canStart && formOpen ? (
          <View style={{ gap: Spacing.md }}>
            <DocumentPickerField
              label="Carte étudiante"
              hint="Photo ou fichier PDF (10 Mo maximum)."
              allowPdf
              value={studentId}
              onChange={setStudentId}
              disabled={submit.isPending}
            />
            <DocumentPickerField
              label="Reçu (inscription ou paiement)"
              hint="Photo, capture d'écran ou fichier PDF (10 Mo maximum)."
              allowPdf
              value={receipt}
              onChange={setReceipt}
              disabled={submit.isPending}
            />
            <AppText variant="caption" color="onSurfaceVariant">
              {"Vos documents sont examinés par l'équipe Domilix avant validation. Ce statut expire automatiquement au bout d'un an."}
            </AppText>
            <Button
              label="Envoyer la vérification"
              icon="send"
              size="lg"
              fullWidth
              loading={submit.isPending}
              onPress={handleSubmit}
            />
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}
