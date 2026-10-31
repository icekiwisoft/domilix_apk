import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText, pressedStyle } from '@/components/ui';
import { Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  /** TalkBack label of the link, e.g. "Tout voir à Douala". */
  seeAllLabel?: string;
}

/** Section title with a "Tout voir" link; they wrap onto two lines at 200 % instead of touching. */
export function SectionHeader({ title, onSeeAll, seeAllLabel }: SectionHeaderProps) {
  const C = useThemeColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: Spacing.md,
      }}
    >
      <AppText variant="headline" accessibilityRole="header" style={{ flexShrink: 1 }}>
        {title}
      </AppText>
      {onSeeAll ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={seeAllLabel ?? 'Tout voir'}
          onPress={onSeeAll}
          style={({ pressed }) => [
            { minHeight: Sizes.touchTarget, flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs },
            pressedStyle(pressed),
          ]}
        >
          <AppText variant="label" color="link">
            Tout voir
          </AppText>
          <MaterialIcons name="chevron-right" size={Sizes.icon} color={C.link} />
        </Pressable>
      ) : null}
    </View>
  );
}
