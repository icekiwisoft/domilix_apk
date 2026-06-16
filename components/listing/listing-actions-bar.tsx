import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ListingActionsBarProps {
  unlocked: boolean;
  loading?: boolean;
  onShare?: () => void;
  onUnlock?: () => void;
}

export function ListingActionsBar({ unlocked, loading, onShare, onUnlock }: ListingActionsBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: C.surface,
          borderTopColor: C.outlineVariant + '4D',
          paddingBottom: insets.bottom + Spacing.md,
        },
      ]}
    >
      {/* Share */}
      <Pressable
        onPress={onShare}
        style={[styles.shareBtn, { borderColor: C.outlineVariant }]}
      >
        <MaterialIcons name="share" size={22} color={C.onSurface} />
      </Pressable>

      {/* Primary action */}
      <Pressable
        onPress={onUnlock}
        disabled={loading}
        style={[
          styles.primaryBtn,
          { backgroundColor: unlocked ? C.primaryContainer : C.primary, opacity: loading ? 0.7 : 1 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={C.onPrimary} />
        ) : (
          <>
            <MaterialIcons
              name={unlocked ? 'lock-open' : 'lock'}
              size={18}
              color={C.onPrimary}
            />
            <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
              {unlocked ? "Contacter l'agent" : 'Débloquer le contact'}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 12,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: '#633f00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
});
