import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { IconButton } from './icon-button';

export interface ProgressBarProps {
  /** 0 to 1. */
  value: number;
  /** Read by TalkBack, e.g. "Étape 2 sur 5". */
  label?: string;
}

/**
 * Thin progress bar: `link` fill on surfaceContainerHighest (5:1 light,
 * 7.4:1 dark, above the 3:1 for graphics).
 */
export function ProgressBar({ value, label }: ProgressBarProps) {
  const C = useThemeColors();
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessible={!!label}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      style={{
        height: Sizes.progress,
        borderRadius: Radii.full,
        overflow: 'hidden',
        backgroundColor: C.surfaceContainerHighest,
      }}
    >
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: Radii.full, backgroundColor: C.link }} />
    </View>
  );
}

export interface StepHeaderProps {
  /** Flow title, e.g. "Nouvelle annonce". */
  title: string;
  /** 1-based current step. */
  step: number;
  total: number;
  /** Optional name of the current step, shown after "Étape n sur N" ("Photos"). */
  stepLabel?: string;
  onBack: () => void;
  /** First step: a close icon (leaves the flow) instead of back. */
  closeMode?: boolean;
  /** Right-hand action (IconButton, text Button "Brouillon"). */
  action?: ReactNode;
}

/**
 * Header of a multi-step flow (create a listing): 48 dp back / close,
 * title, "Étape n sur N" and a progress bar. Generalises
 * components/forms/create-step-header.tsx; the step is written out, not
 * only "2/5", and the title wraps at 200 %. Pass it as `<Screen header>`.
 */
export function StepHeader({ title, step, total, stepLabel, onBack, closeMode = false, action }: StepHeaderProps) {
  const progressText = `Étape ${step} sur ${total}`;
  return (
    <View style={{ paddingHorizontal: Spacing.xs, paddingBottom: Spacing.sm, gap: Spacing.xs }}>
      <View style={{ minHeight: Sizes.touchTarget, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
        <IconButton
          icon={closeMode ? 'close' : 'arrow-back'}
          label={closeMode ? 'Fermer' : 'Retour'}
          onPress={onBack}
        />
        <View style={{ flex: 1, paddingVertical: Spacing.xs }}>
          <AppText variant="headline" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="caption" color="onSurfaceVariant">
            {stepLabel ? `${progressText} · ${stepLabel}` : progressText}
          </AppText>
        </View>
        {action}
      </View>
      <View style={{ paddingHorizontal: Spacing.ms }}>
        <ProgressBar value={step / total} />
      </View>
    </View>
  );
}
