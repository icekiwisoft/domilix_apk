import { View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { Borders, Radii, Sizes, Spacing, TextVariants } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

/** Loading placeholder with the shape of a NotifItem. */
export function NotifSkeleton() {
  const C = useThemeColors();
  const line = TextVariants.body.fontSize;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.ms,
        paddingHorizontal: Spacing.marginMobile,
        paddingVertical: Spacing.ms,
        borderBottomWidth: Borders.thin,
        borderBottomColor: C.outlineVariant,
      }}
    >
      <Skeleton width={Sizes.avatarMd} height={Sizes.avatarMd} radius={Radii.full} />
      <View style={{ flex: 1, gap: Spacing.sm }}>
        <Skeleton width="70%" height={line} />
        <Skeleton width="90%" height={line} />
        <Skeleton width="25%" height={line} />
      </View>
    </View>
  );
}
