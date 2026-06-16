import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useUnlockAnnounce } from '@/hooks/queries/use-announces';
import { useToast } from '@/components/ui/toast';

export default function UnlockConfirmScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { announceId } = useLocalSearchParams<{ announceId: string }>();
  const { data: me } = useMe();
  const unlockAnnounce = useUnlockAnnounce();
  const toast = useToast();

  const userCredits = me?.credits ?? 0;
  const hasEnoughCredits = userCredits >= 1;

  function handleConfirm() {
    if (!announceId || !hasEnoughCredits) return;
    unlockAnnounce.mutate(announceId, {
      onSuccess: () => {
        toast.show('Annonce débloquée avec succès !', 'success');
        router.back();
      },
      onError: () => {
        toast.show('Impossible de débloquer cette annonce.', 'error');
      },
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

      <View style={[styles.sheet, { backgroundColor: C.surface }]}>
        {/* Handle */}
        <View style={styles.handleWrapper}>
          <View style={[styles.handle, { backgroundColor: C.surfaceVariant }]} />
        </View>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: C.primaryFixed }]}>
          <MaterialIcons name="lock-open" size={32} color={C.primary} />
        </View>

        <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>
          Débloquer le contact
        </Text>
        <Text style={[Typography.bodyMd, styles.body, { color: C.onSurfaceVariant }]}>
          Déverrouiller cette annonce utilisera{' '}
          <Text style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>1 crédit</Text>.
          {'\n'}Il vous reste{' '}
          <Text style={{
            color: hasEnoughCredits ? C.primary : C.error,
            fontFamily: 'PlusJakartaSans_700Bold',
          }}>
            {userCredits} crédit{userCredits > 1 ? 's' : ''}
          </Text>.
        </Text>

        {/* Credits hint */}
        <View style={[styles.creditsRow, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
          <MaterialIcons name="toll" size={18} color={C.primary} />
          <Text style={[Typography.caption, { color: C.onSurface, flex: 1 }]}>
            Vous aurez accès au numéro de téléphone de l'annonceur.
          </Text>
        </View>

        {/* Insufficient credits warning */}
        {!hasEnoughCredits && (
          <View style={[styles.warningRow, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '55' }]}>
            <MaterialIcons name="warning-amber" size={16} color={C.error} />
            <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
              Crédits insuffisants. Rechargez votre solde pour débloquer cette annonce.
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.btn, styles.cancelBtn, { borderColor: C.outlineVariant }]}
          >
            <Text style={[Typography.labelSm, { color: C.onSurface, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Annuler
            </Text>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            disabled={unlockAnnounce.isPending || !hasEnoughCredits}
            style={[
              styles.btn,
              {
                backgroundColor: hasEnoughCredits ? C.primary : C.surfaceVariant,
                opacity: unlockAnnounce.isPending ? 0.6 : 1,
              },
            ]}
          >
            {unlockAnnounce.isPending ? (
              <ActivityIndicator size="small" color={C.onPrimary} />
            ) : (
              <>
                <MaterialIcons
                  name="lock-open"
                  size={16}
                  color={hasEnoughCredits ? C.onPrimary : C.onSurfaceVariant}
                />
                <Text style={[Typography.labelSm, {
                  color: hasEnoughCredits ? C.onPrimary : C.onSurfaceVariant,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }]}>
                  Confirmer (1 crédit)
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.marginMobile,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 20,
  },
  handleWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: Radius.full,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    marginBottom: Spacing.sm,
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.sm,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.lg,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 52,
    borderRadius: Radius.md,
  },
  cancelBtn: {
    borderWidth: 1,
  },
});
