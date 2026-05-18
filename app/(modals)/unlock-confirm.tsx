import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useUnlockAnnounce } from '@/hooks/queries/use-announces';

export default function UnlockConfirmScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const { announceId } = useLocalSearchParams<{ announceId: string }>();
  const { data: me } = useMe();
  const unlockAnnounce = useUnlockAnnounce();

  function handleConfirm() {
    if (!announceId) return;
    unlockAnnounce.mutate(announceId, {
      onSuccess: () => router.back(),
      onError: () => router.back(),
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
          <Text style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>
            {me?.credits_count ?? 0} crédits
          </Text>.
        </Text>

        {/* Credits hint */}
        <View style={[styles.creditsRow, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
          <MaterialIcons name="toll" size={18} color={C.primary} />
          <Text style={[Typography.caption, { color: C.onSurface, flex: 1 }]}>
            Vous aurez accès au numéro de téléphone de l'annonceur.
          </Text>
        </View>

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
            disabled={unlockAnnounce.isPending}
            style={[styles.btn, { backgroundColor: C.primary, opacity: unlockAnnounce.isPending ? 0.6 : 1 }]}
          >
            <MaterialIcons name="lock-open" size={16} color={C.onPrimary} />
            <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
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
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
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
