import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Skeleton } from '@/components/ui';
import { Radii, Sizes, Spacing, TextVariants } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

interface Props {
  onBack: () => void;
}

/** Loading placeholder with the layout of the listing detail (gallery, title, facts, description, announcer). */
export function AnnounceDetailSkeleton({ onBack }: Props) {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const line = TextVariants.body.fontSize;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View
        accessible
        accessibilityLabel="Chargement de l'annonce…"
        accessibilityState={{ busy: true }}
        style={{ flex: 1 }}
      >
        <Skeleton height={insets.top + Sizes.detailGallery} radius={0} />
        <View
          style={{
            marginTop: -Spacing.lg,
            borderTopLeftRadius: Radii.card,
            borderTopRightRadius: Radii.card,
            backgroundColor: C.background,
            padding: Spacing.marginMobile,
            gap: Spacing.lg,
          }}
        >
          <View style={{ gap: Spacing.sm }}>
            <Skeleton width="30%" height={line} />
            <Skeleton width="90%" height={TextVariants.title.fontSize} />
            <Skeleton width="60%" height={TextVariants.title.fontSize} />
            <Skeleton width="50%" height={line} />
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {[1, 2, 3].map((k) => (
              <View key={k} style={{ flex: 1 }}>
                <Skeleton height={Sizes.touchTarget + Spacing.lg} radius={Radii.control} />
              </View>
            ))}
          </View>
          <View style={{ gap: Spacing.sm }}>
            <Skeleton width="40%" height={TextVariants.headline.fontSize} />
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} width={k === 3 ? '70%' : '100%'} height={line} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.ms }}>
            <Skeleton width={Sizes.avatarMd} height={Sizes.avatarMd} radius={Radii.full} />
            <View style={{ flex: 1, gap: Spacing.xs }}>
              <Skeleton width="50%" height={line} />
              <Skeleton width="35%" height={line} />
            </View>
          </View>
        </View>
      </View>
      <IconButton
        icon="arrow-back"
        label="Retour"
        overlay
        onPress={onBack}
        style={{ position: 'absolute', top: insets.top + Spacing.sm, left: Spacing.ms }}
      />
    </View>
  );
}
