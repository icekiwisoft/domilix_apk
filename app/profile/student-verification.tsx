import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { DocumentPickerField } from '@/components/forms/document-picker-field';
import { LoginGate } from '@/components/ui/login-gate';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentVerification, useSubmitStudentVerification } from '@/hooks/queries/use-verification';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatDateFr } from '@/lib/format-date';
import type { PickedFile } from '@/services/uploads.service';
import { useAuthStore } from '@/stores/auth.store';

type DisplayStatus = 'none' | 'pending' | 'approved' | 'expired' | 'rejected';

const STATUS_LABELS: Record<DisplayStatus, string> = {
  none: 'Statut étudiant non vérifié',
  pending: 'Demande en attente de vérification',
  approved: 'Statut étudiant vérifié',
  expired: 'Statut étudiant expiré',
  rejected: 'Demande refusée',
};

export default function StudentVerificationScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: request, isLoading } = useStudentVerification();
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

  const statusColors: Record<DisplayStatus, { bg: string; fg: string }> = {
    none: { bg: C.surfaceContainerHigh, fg: C.onSurfaceVariant },
    pending: { bg: C.primaryFixed, fg: C.primary },
    approved: { bg: '#d1fae5', fg: '#047857' },
    expired: { bg: C.errorContainer, fg: C.error },
    rejected: { bg: C.errorContainer, fg: C.error },
  };

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

  if (!accessToken) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <LoginGate
          title="Statut étudiant"
          subtitle="Connectez-vous pour déclarer votre statut étudiant."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Retour">
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>Statut étudiant</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 22 }]}>
              Déclarez votre statut étudiant en envoyant votre carte étudiante et un reçu (preuve d&apos;inscription ou de
              paiement). Ce statut est valable 1 an, après quoi une nouvelle vérification sera nécessaire.
            </Text>

            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <View style={[styles.chip, { backgroundColor: statusColors[status].bg }]}>
                <Text style={[Typography.labelSm, { color: statusColors[status].fg }]}>{STATUS_LABELS[status]}</Text>
              </View>
            )}

            {status === 'approved' && !!request?.expires_at && (
              <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                Valable jusqu&apos;au {formatDateFr(request.expires_at)}
              </Text>
            )}
            {status !== 'approved' && !!request?.created_at && (
              <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                Demande envoyée le {formatDateFr(request.created_at)}
              </Text>
            )}

            {canStart && !formOpen && (
              <Button mode="contained" onPress={() => setFormOpen(true)}>
                {status === 'rejected' || status === 'expired'
                  ? 'Renvoyer une vérification'
                  : status === 'approved'
                    ? 'Renouveler la vérification'
                    : 'Vérifier mon statut étudiant'}
              </Button>
            )}

            {canStart && formOpen && (
              <View style={styles.form}>
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
                <Text style={[Typography.caption, { color: C.onSurfaceVariant, lineHeight: 18 }]}>
                  Vos documents sont examinés par l&apos;équipe Domilix avant validation. Ce statut expire automatiquement
                  au bout d&apos;un an.
                </Text>
                <Button mode="contained" onPress={handleSubmit} loading={submit.isPending} disabled={submit.isPending}>
                  Envoyer la vérification
                </Button>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  form: { gap: Spacing.md },
});
