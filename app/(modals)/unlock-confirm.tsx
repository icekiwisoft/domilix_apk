import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useUnlockAnnounce } from '@/hooks/queries/use-announces';
import { useToast } from '@/components/ui/toast';
import { pressedStyle } from '@/components/ui/pressed';

export default function UnlockConfirmScreen() {
  const { fontScale } = useWindowDimensions();
  const btnBasis = 140 * Math.max(1, fontScale);
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { announceId } = useLocalSearchParams<{ announceId: string }>();
  const { data: me } = useMe();
  const unlockAnnounce = useUnlockAnnounce();
  const toast = useToast();

  const userCredits = me?.credits ?? 0;
  const hasEnoughCredits = userCredits >= 1;
  const confirmDisabled = unlockAnnounce.isPending || !hasEnoughCredits;

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
          <MaterialIcons name="lock-open" size={32} color={C.onPrimaryFixed} />
        </View>

        <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>
          Débloquer le contact
        </Text>
        <Text style={[Typography.bodyMd, styles.body, { color: C.onSurfaceVariant }]}>
          Déverrouiller cette annonce utilisera{' '}
          <Text style={{ color: C.link, fontFamily: Fonts.bold }}>1 crédit</Text>.
          {'\n'}Il vous reste{' '}
          <Text style={{
            color: hasEnoughCredits ? C.link : C.error,
            fontFamily: Fonts.bold,
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
          {/* Not Paper Buttons: their label is forced to one line and was cut to
              "Confirme.." at 200 % font size (QA-05). These wrap, and the two
              buttons stack when they no longer fit side by side. */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.btn,
              { flexBasis: btnBasis, borderWidth: 1, borderColor: C.outline },
              pressedStyle(pressed),
            ]}
          >
            <Text style={[Typography.labelMd, styles.btnLabel, { color: C.link }]}>Annuler</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: confirmDisabled, busy: unlockAnnounce.isPending }}
            disabled={confirmDisabled}
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.btn,
              { flexBasis: btnBasis, backgroundColor: C.primary, opacity: confirmDisabled ? 0.5 : 1 },
              pressedStyle(pressed),
            ]}
          >
            {unlockAnnounce.isPending ? (
              <ActivityIndicator size="small" color={C.onPrimary} />
            ) : (
              <MaterialIcons name="lock-open" size={18} color={C.onPrimary} />
            )}
            <Text style={[Typography.labelMd, styles.btnLabel, { color: C.onPrimary }]}>
              Confirmer (1 crédit)
            </Text>
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
    flexWrap: 'wrap',
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.lg,
  },
  btn: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  btnLabel: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
  },
});
