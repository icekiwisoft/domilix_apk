import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Sizes, Spacing } from '@/constants/theme';

import { AppText } from './app-text';
import { IconButton } from './icon-button';

export interface ScreenHeaderProps {
  title: string;
  /**
   * Back action. Omitted: goes back when there is a screen to return to, and
   * hides the button otherwise. `false` always hides it.
   */
  onBack?: (() => void) | false;
  /** TalkBack label of the back button. */
  backLabel?: string;
  /** Icon buttons aligned right (IconButton, 48 dp each). */
  actions?: ReactNode;
}

/**
 * Top bar of a screen (Material 3 small top app bar): 48 dp back button,
 * title that wraps onto two lines or more at 200 % instead of being cut,
 * optional actions. Pass it as `<Screen header={...}>`.
 */
export function ScreenHeader({ title, onBack, backLabel = 'Retour', actions }: ScreenHeaderProps) {
  const router = useRouter();
  const back = onBack === false ? null : (onBack ?? (router.canGoBack() ? () => router.back() : null));
  return (
    <View
      style={{
        minHeight: Sizes.touchTarget,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.xs,
        paddingVertical: Spacing.xs,
      }}
    >
      {/* Without a back button, the spacer aligns the title on Spacing.marginMobile. */}
      {back ? <IconButton icon="arrow-back" label={backLabel} onPress={back} /> : <View style={{ width: Spacing.ms }} />}
      <AppText variant="headline" accessibilityRole="header" style={{ flex: 1 }}>
        {title}
      </AppText>
      {actions ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>{actions}</View> : null}
    </View>
  );
}
