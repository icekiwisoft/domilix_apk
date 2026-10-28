import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

export function ReportDialog({ visible, announceId, onDismiss }: ReportDialogProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
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
    if (!reason) return;
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
    <Portal>
      <Dialog visible={visible} onDismiss={close}>
        <Dialog.Title>Signaler l&apos;annonce</Dialog.Title>
        <Dialog.Content style={{ gap: Spacing.md }}>
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant }]}>Motif du signalement</Text>
          <View style={styles.reasons}>
            {REASONS.map((item) => {
              const selected = reason === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setReason(item)}
                  style={[
                    styles.reason,
                    {
                      borderColor: selected ? C.primary : C.outlineVariant,
                      backgroundColor: selected ? C.primaryFixed + '55' : 'transparent',
                    },
                  ]}
                >
                  <MaterialIcons
                    name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={selected ? C.primary : C.onSurfaceVariant}
                  />
                  <Text style={[Typography.bodyMd, { color: C.onSurface }]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          <Input
            label="Détails supplémentaires"
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={2000}
            placeholder="Décrivez le problème..."
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button mode="text" onPress={close} disabled={report.isPending}>Annuler</Button>
          <Button
            mode="text"
            textColor={C.error}
            onPress={submit}
            loading={report.isPending}
            disabled={!reason || report.isPending}
          >
            Signaler
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  reasons: { gap: Spacing.xs },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
