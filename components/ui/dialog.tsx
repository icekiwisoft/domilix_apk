import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Radii, Shadows, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { Button } from './button';

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Extra content under the message (a Field, a summary). */
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  /** Called by the cancel button, the back button and a tap on the scrim. */
  onCancel: () => void;
  /** Destructive confirmation ("Supprimer"): red confirm button. */
  danger?: boolean;
  /** Confirm in progress: buttons disabled, back button and scrim ignored. */
  loading?: boolean;
}

/**
 * Confirmation dialog (Material 3 basic dialog), replaces Paper Dialog +
 * Portal. Opens in its own window, so TalkBack moves into it and reads the
 * title first; the Android back button and a tap outside cancel it. The
 * buttons sit side by side and stack when they no longer fit (200 %).
 */
export function Dialog({
  visible,
  title,
  message,
  children,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Annuler',
  onCancel,
  danger = false,
  loading = false,
}: DialogProps) {
  const C = useThemeColors();
  const cancel = () => {
    if (!loading) onCancel();
  };
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={cancel}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.center}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }]}
          onPress={cancel}
          accessible={false}
          importantForAccessibility="no"
        />
        <View
          accessibilityViewIsModal
          style={[
            {
              width: '100%',
              maxWidth: Sizes.dialogMaxWidth,
              maxHeight: '90%',
              padding: Spacing.lg,
              gap: Spacing.md,
              borderRadius: Radii.card,
              backgroundColor: C.surfaceContainerLowest,
            },
            Shadows.floating,
          ]}
        >
          <AppText variant="headline" accessibilityRole="header">
            {title}
          </AppText>
          {message ? <AppText color="onSurfaceVariant">{message}</AppText> : null}
          {children}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap-reverse',
              justifyContent: 'flex-end',
              gap: Spacing.sm,
              marginTop: Spacing.sm,
            }}
          >
            <Button label={cancelLabel} variant="text" onPress={cancel} disabled={loading} />
            <Button
              label={confirmLabel}
              variant={danger ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
});
