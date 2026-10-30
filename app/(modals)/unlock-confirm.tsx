import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Divider } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { Borders, Radii, Shadows, Sizes, Spacing } from '@/constants/theme';
import { useUnlockAnnounce } from '@/hooks/queries/use-announces';
import { useMe } from '@/hooks/queries/use-auth-queries';
import { useThemeColors } from '@/hooks/use-theme-color';

/** Largest share of the window the sheet takes; the text scrolls beyond (200 % font size). */
const MAX_HEIGHT = 0.9;

/** Domicoins taken by one unlock. */
const UNLOCK_COST = 1;

function domicoins(n: number) {
  return `${n} Domicoin${n > 1 ? 's' : ''}`;
}

function CostRow({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label} : ${value}`}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.ms,
      }}
    >
      <AppText color="onSurfaceVariant">{label}</AppText>
      <AppText variant="bodyStrong" color={warn ? 'error' : 'onSurface'}>
        {value}
      </AppText>
    </View>
  );
}

export default function UnlockConfirmScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { announceId } = useLocalSearchParams<{ announceId: string }>();
  const { data: me } = useMe();
  const unlockAnnounce = useUnlockAnnounce();
  const toast = useToast();

  const userCredits = me?.credits ?? 0;
  const hasEnoughCredits = userCredits >= UNLOCK_COST;
  // The warning waits for the balance: no "insufficient" flash while it loads.
  const showShortage = !!me && !hasEnoughCredits;

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
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }]}
        onPress={() => router.back()}
        accessible={false}
        importantForAccessibility="no"
      />

      <View
        accessibilityViewIsModal
        style={[
          {
            borderTopLeftRadius: Radii.card,
            borderTopRightRadius: Radii.card,
            maxHeight: (height - insets.top) * MAX_HEIGHT,
            backgroundColor: C.surface,
            paddingTop: Spacing.sm,
            paddingBottom: insets.bottom + Spacing.lg,
            gap: Spacing.md,
          },
          Shadows.floating,
        ]}
      >
        <View
          importantForAccessibility="no"
          style={{
            alignSelf: 'center',
            width: Sizes.grabberWidth,
            height: Sizes.grabberHeight,
            borderRadius: Radii.full,
            backgroundColor: C.outline,
          }}
        />

        {/* The buttons stay pinned under the scrolling text, always reachable. */}
        <ScrollView
          style={{ flexShrink: 1 }}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.md }}
        >
          <View
            importantForAccessibility="no-hide-descendants"
            style={{
              alignSelf: 'center',
              width: Sizes.stateIcon,
              height: Sizes.stateIcon,
              borderRadius: Radii.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.primaryFixed,
            }}
          >
            <MaterialIcons name="lock-open" size={Sizes.stateIcon / 2} color={C.onPrimaryFixed} />
          </View>

          <View style={{ gap: Spacing.xs }}>
            <AppText variant="headline" accessibilityRole="header" style={{ textAlign: 'center' }}>
              Débloquer cette annonce
            </AppText>
            <AppText color="onSurfaceVariant" style={{ textAlign: 'center' }}>
              {"Vous aurez accès au numéro de téléphone et aux coordonnées de l'annonceur."}
            </AppText>
          </View>

          <View
            style={{
              borderRadius: Radii.card,
              borderWidth: Borders.thin,
              borderColor: C.outlineVariant,
              backgroundColor: C.surfaceContainerLowest,
            }}
          >
            <CostRow label="Coût" value={domicoins(UNLOCK_COST)} />
            <Divider />
            <CostRow label="Votre solde" value={domicoins(userCredits)} warn={showShortage} />
          </View>

          {showShortage ? (
            <View
              accessible
              accessibilityLiveRegion="polite"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.sm,
                padding: Spacing.ms,
                borderRadius: Radii.control,
                backgroundColor: C.errorContainer,
              }}
            >
              <MaterialIcons name="warning-amber" size={Sizes.icon} color={C.onErrorContainer} />
              <AppText variant="caption" color="onErrorContainer" style={{ flex: 1 }}>
                Domicoins insuffisants. Rechargez votre solde pour débloquer cette annonce.
              </AppText>
            </View>
          ) : null}

        </ScrollView>

        <View style={{ gap: Spacing.sm, paddingHorizontal: Spacing.lg }}>
          <Button
            size="lg"
            fullWidth
            icon="lock-open"
            label={`Débloquer pour ${domicoins(UNLOCK_COST)}`}
            loading={unlockAnnounce.isPending}
            disabled={!hasEnoughCredits}
            onPress={handleConfirm}
          />
          <Button size="lg" fullWidth variant="secondary" label="Annuler" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}
