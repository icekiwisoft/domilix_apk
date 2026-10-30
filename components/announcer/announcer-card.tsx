import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Avatar, Card } from '@/components/ui';
import { Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import type { Announcer } from '@/types/announcer';

interface AnnouncerCardProps {
  announcer: Announcer;
  /** Other listings of the announcer; the line is left out when unknown or 0. */
  announcesCount?: number;
  onPress?: () => void;
}

/** Announcer of a listing: avatar, name, verified status and listing count, opens the profile. */
export function AnnouncerCard({ announcer, announcesCount, onPress }: AnnouncerCardProps) {
  const C = useThemeColors();
  const displayName = announcer.company_name ?? announcer.name ?? 'Annonceur';
  const count =
    announcesCount && announcesCount > 0 ? `${announcesCount} annonce${announcesCount > 1 ? 's' : ''}` : null;
  const subtitle = [announcer.verified ? 'Annonceur vérifié' : 'Annonceur', count].filter(Boolean).join(' · ');

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${displayName}, ${subtitle}. Voir le profil`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.ms, padding: Spacing.ms }}
    >
      <Avatar name={displayName} uri={announcer.avatar} />
      <View style={{ flex: 1, gap: Spacing.xxs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' }}>
          <AppText variant="bodyStrong" style={{ flexShrink: 1 }}>
            {displayName}
          </AppText>
          {announcer.verified ? <MaterialIcons name="verified" size={Sizes.iconSm} color={C.link} /> : null}
        </View>
        <AppText variant="caption" color="onSurfaceVariant">
          {subtitle}
        </AppText>
      </View>
      <MaterialIcons name="chevron-right" size={Sizes.iconLg} color={C.onSurfaceVariant} />
    </Card>
  );
}
