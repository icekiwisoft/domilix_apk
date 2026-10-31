import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Dialog, Field, RadioRow, useToast } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useReportAnnounce } from '@/hooks/queries/use-announces';
import { getApiErrorMessage } from '@/lib/api-error';

const REASONS = [
  'Annonce frauduleuse',
  'Prix incorrect',
  'Photos trompeuses',
  'Localisation incorrecte',
  'Contenu inapproprié',
  'Autre',
];

interface ReportDialogProps {
  visible: boolean;
  announceId: string;
  onDismiss: () => void;
}

/** "Signaler l'annonce": a reason (required, 3 to 255 characters server-side) and optional details. */
export function ReportDialog({ visible, announceId, onDismiss }: ReportDialogProps) {
  const toast = useToast();
  const report = useReportAnnounce();
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  function close() {
    setReason(null);
    setDetails('');
    onDismiss();
  }

  function submit() {
    if (!reason) {
      toast.show('Choisissez un motif de signalement.', 'error');
      return;
    }
    report.mutate(
      { id: announceId, reason, details: details.trim() || undefined },
      {
        onSuccess: () => {
          toast.show('Signalement envoyé. Merci de nous aider à garder Domilix sûr.', 'success');
          close();
        },
        onError: (err) => toast.show(getApiErrorMessage(err, "Impossible d'envoyer le signalement."), 'error'),
      }
    );
  }

  return (
    <Dialog
      visible={visible}
      title="Signaler l'annonce"
      confirmLabel="Signaler"
      danger
      loading={report.isPending}
      onConfirm={submit}
      onCancel={close}
    >
      <View style={{ gap: Spacing.sm }}>
        <AppText variant="label" color="onSurfaceVariant">
          Motif du signalement
        </AppText>
        <View accessibilityRole="radiogroup" accessibilityLabel="Motif du signalement" style={{ gap: Spacing.xs }}>
          {REASONS.map((item) => (
            <RadioRow key={item} title={item} selected={reason === item} onPress={() => setReason(item)} />
          ))}
        </View>
        <Field
          label="Détails supplémentaires"
          labelHint="(facultatif)"
          value={details}
          onChangeText={setDetails}
          multiline
          maxLength={2000}
          placeholder="Décrivez le problème..."
        />
      </View>
    </Dialog>
  );
}
