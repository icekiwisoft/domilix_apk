import { View } from 'react-native';

import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { IconButton } from './icon-button';

export interface SheetHeaderProps {
  title: string;
  /** Shows a 48 dp close button when given. */
  onClose?: () => void;
  closeLabel?: string;
}

/** Top of a bottom sheet or modal: drag handle, title and close button. */
export function SheetHeader({ title, onClose, closeLabel = 'Fermer' }: SheetHeaderProps) {
  const C = useThemeColors();
  return (
    <View style={{ gap: Spacing.sm, paddingTop: Spacing.sm }}>
      <View
        accessible={false}
        importantForAccessibility="no"
        style={{
          alignSelf: 'center',
          width: Sizes.grabberWidth,
          height: Sizes.grabberHeight,
          borderRadius: Radii.full,
          backgroundColor: C.outline,
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: Sizes.touchTarget }}>
        <AppText variant="headline" accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </AppText>
        {onClose ? (
          <IconButton icon="close" label={closeLabel} onPress={onClose} background="surfaceContainerHigh" />
        ) : null}
      </View>
    </View>
  );
}
