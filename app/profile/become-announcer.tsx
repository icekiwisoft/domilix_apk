import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { DocumentPickerField } from '@/components/forms/document-picker-field';
import { Input } from '@/components/ui/input';
import { LoginGate } from '@/components/ui/login-gate';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBecomeAnnouncer, useMe } from '@/hooks/queries/use-auth-queries';
import { useAnnouncerRequest, useSubmitAnnouncerVerification } from '@/hooks/queries/use-verification';
import { getApiErrorMessage } from '@/lib/api-error';
import { isAnnouncerToken } from '@/lib/decode-token';
import { formatDateFr } from '@/lib/format-date';
import type { PickedFile } from '@/services/uploads.service';
import { useAuthStore } from '@/stores/auth.store';

type DisplayStatus = 'none' | 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<DisplayStatus, string> = {
  none: 'Compte annonceur non vérifié',
  pending: 'Demande en attente de vérification',
  approved: 'Compte annonceur vérifié',
  rejected: 'Demande refusée',
};

export default function BecomeAnnouncerScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading: userLoading } = useMe();
  const { data: request, isLoading: requestLoading } = useAnnouncerRequest();
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

  const statusColors: Record<DisplayStatus, { bg: string; fg: string }> = {
    none: { bg: C.surfaceContainerHigh, fg: C.onSurfaceVariant },
    pending: { bg: C.primaryFixed, fg: C.primary },
    approved: { bg: '#d1fae5', fg: '#047857' },
    rejected: { bg: C.errorContainer, fg: C.error },
  };

  function handleActivate() {
    becomeAnnouncer.mutate(undefined, {
      onSuccess: () => toast.show('Votre compte annonceur est activé.', 'success'),
      onError: (err) =>
        toast.show(getApiErrorMessage(err, "Impossible d'activer votre compte annonceur."), 'error'),
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

  if (!accessToken) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <LoginGate
          title="Devenir annonceur"
          subtitle="Connectez-vous pour activer votre profil annonceur et publier vos annonces."
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
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>Devenir annonceur</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {userLoading ? (
            <ActivityIndicator style={{ marginTop: Spacing.xl }} />
          ) : !isAnnouncer ? (
            <View style={[styles.card, { backgroundColor: C.primaryFixed + '55', borderColor: C.primaryFixed }]}>
              <MaterialIcons name="storefront" size={34} color={C.primary} />
              <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>
                Activez votre profil annonceur
              </Text>
              <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 22 }]}>
                Créez votre espace annonceur pour publier vos annonces. La vérification d&apos;identité pourra être
                demandée ensuite.
              </Text>
              <Button
                mode="contained"
                onPress={handleActivate}
                loading={becomeAnnouncer.isPending}
                disabled={becomeAnnouncer.isPending}
              >
                Devenir annonceur
              </Button>
            </View>
          ) : (
            <>
              <View style={[styles.banner, { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }]}>
                <MaterialIcons name="check-circle" size={22} color="#047857" />
                <Text style={[Typography.bodyMd, { color: '#047857', fontFamily: 'PlusJakartaSans_700Bold' }]}>
                  Compte annonceur actif
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
                <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
                  Vérification du profil
                </Text>
                <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, lineHeight: 22 }]}>
                  Envoyez une photo de votre CNI afin que l&apos;équipe Domilix puisse vérifier votre identité avant
                  validation.
                </Text>

                <View style={[styles.chip, { backgroundColor: statusColors[status].bg }]}>
                  {requestLoading ? (
                    <Text style={[Typography.caption, { color: statusColors[status].fg }]}>Chargement du statut...</Text>
                  ) : (
                    <Text style={[Typography.labelSm, { color: statusColors[status].fg }]}>
                      {STATUS_LABELS[status]}
                    </Text>
                  )}
                </View>
                {!!request?.created_at && status !== 'approved' && (
                  <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
                    Demande envoyée le {formatDateFr(request.created_at)}
                  </Text>
                )}

                {canStartVerification && !formOpen && (
                  <Button mode="contained" onPress={() => setFormOpen(true)}>
                    {status === 'rejected' ? 'Renvoyer une vérification' : 'Démarrer une vérification'}
                  </Button>
                )}

                {canStartVerification && formOpen && (
                  <View style={styles.form}>
                    <DocumentPickerField
                      label="Photo de votre CNI"
                      value={document}
                      onChange={setDocument}
                      disabled={submitVerification.isPending}
                    />
                    <Input
                      label="Numéro de téléphone de contact (optionnel)"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder="+237 6XX XX XX XX"
                    />
                    <Text style={[Typography.caption, { color: C.onSurfaceVariant, lineHeight: 18 }]}>
                      Avant d&apos;envoyer, vérifiez que vos coordonnées sont correctes et que vous êtes inscrit avec une
                      adresse e-mail ou un numéro de téléphone joignable.
                    </Text>
                    <Button
                      mode="contained"
                      onPress={handleSubmitVerification}
                      loading={submitVerification.isPending}
                      disabled={submitVerification.isPending}
                    >
                      Envoyer la vérification
                    </Button>
                  </View>
                )}
              </View>

              <Button mode="outlined" icon="storefront" onPress={() => router.push('/profile/announcer-profile')}>
                Modifier mon profil annonceur
              </Button>
            </>
          )}
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  form: { gap: Spacing.md },
});
