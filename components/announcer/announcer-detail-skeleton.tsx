import { View } from 'react-native';

import { Card, ListingCardSkeleton, Screen, ScreenHeader, Skeleton } from '@/components/ui';
import { Radii, Sizes, Spacing, TextVariants } from '@/constants/theme';

interface Props {
  onBack: () => void;
}

/** Loading placeholder with the layout of the announcer profile (identity card, tabs, listings). */
export function AnnouncerDetailSkeleton({ onBack }: Props) {
  const line = TextVariants.body.fontSize;
  return (
    <Screen header={<ScreenHeader title="Annonceur" onBack={onBack} />} scroll={false} contentStyle={{ gap: Spacing.lg }}>
      <View accessible accessibilityLabel="Chargement du profil…" accessibilityState={{ busy: true }} style={{ gap: Spacing.lg }}>
        <Card style={{ alignItems: 'center', padding: Spacing.marginMobile }}>
          <Skeleton width={Sizes.avatarLg} height={Sizes.avatarLg} radius={Radii.full} />
          <Skeleton width="55%" height={TextVariants.title.fontSize} />
          <Skeleton width="35%" height={line} />
          <View style={{ flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around', paddingTop: Spacing.sm }}>
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} width={Sizes.touchTarget} height={TextVariants.headline.lineHeight} />
            ))}
          </View>
        </Card>
        <Skeleton height={Sizes.touchTarget + Spacing.sm} radius={Radii.full} />
        <ListingCardSkeleton />
      </View>
    </Screen>
  );
}
