import { View } from 'react-native';

import { AppText, Button, type IconName } from '@/components/ui';
import { Borders, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

/** Title of the create flow (website: adForm.create.title). */
export const CREATE_TITLE = 'Créer une annonce';

/**
 * Steps of the create flow, for every property type: 1 type and category,
 * 2 characteristics, 3 location and photos, 4 price and description.
 */
export const CREATE_STEPS = 4;

/** Title and short explanation at the top of a step. */
export function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <View style={{ gap: Spacing.xs }}>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      <AppText color="onSurfaceVariant">{description}</AppText>
    </View>
  );
}

export interface StepFooterProps {
  /** Main action, "Suivant" by default (website: common.next). */
  label?: string;
  onNext: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  /** Steps 2 and later: "Précédent" goes back one step, as on the website. */
  onPrevious?: () => void;
  /** Said under the buttons while the main action is disabled (what is missing). */
  hint?: string;
}

/**
 * Action bar of the create and edit flows, passed as `<Screen footer>`: it
 * stays above the gesture bar, and above the keyboard while it is open.
 * Both buttons are 52 dp and wrap onto two rows at large font sizes.
 */
export function StepFooter({ label = 'Suivant', onNext, icon, disabled, loading, onPrevious, hint }: StepFooterProps) {
  const C = useThemeColors();
  return (
    <View
      style={{
        paddingHorizontal: Spacing.marginMobile,
        paddingVertical: Spacing.ms,
        gap: Spacing.sm,
        borderTopWidth: Borders.thin,
        borderTopColor: C.outlineVariant,
      }}
    >
      {disabled && hint ? (
        <AppText variant="caption" color="onSurfaceVariant">
          {hint}
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.ms }}>
        {onPrevious ? (
          <Button label="Précédent" variant="secondary" size="lg" onPress={onPrevious} style={{ flexGrow: 1 }} />
        ) : null}
        <Button
          label={label}
          icon={icon}
          size="lg"
          disabled={disabled}
          loading={loading}
          onPress={onNext}
          accessibilityHint={disabled ? hint : undefined}
          style={{ flexGrow: 2 }}
        />
      </View>
    </View>
  );
}
