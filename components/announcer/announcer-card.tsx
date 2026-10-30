import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

const FAVICON = require('@/assets/images/favicon.png');

interface AnnouncerCardProps {
  /** `announcer.verified`, the only announcer field the API returns on a listing. */
  verified?: boolean;
}

/**
 * Announcer of a listing, as on the website (domilix.com Ad.tsx, announcer
 * mini-card). The backend anonymises the announcer on every listing
 * (`serializePublicAnnouncer` returns only `{ verified }`), so there is no
 * name, profile link or listing count: the Domilix logo, "Annonce proposée
 * sur Domilix" and, when verified, "Identité vérifiée". One TalkBack item.
 */
export function AnnouncerCard({ verified = false }: AnnouncerCardProps) {
  const C = useThemeColors();
  const title = 'Annonce proposée sur Domilix';
  return (
    <Card
      accessible
      accessibilityLabel={verified ? `${title}, identité vérifiée` : title}
      style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.ms, padding: Spacing.ms }}
    >
      <View
        style={{
          width: Sizes.avatarMd,
          height: Sizes.avatarMd,
          borderRadius: Radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: Borders.thin,
          borderColor: C.outlineVariant,
          backgroundColor: C.surfaceContainerLowest,
        }}
      >
        <Image source={FAVICON} style={{ width: Sizes.avatarSm, height: Sizes.avatarSm }} contentFit="contain" />
      </View>
      <View style={{ flex: 1, gap: Spacing.xxs }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {verified ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <MaterialIcons name="check-circle" size={Sizes.iconSm} color={C.success} />
            <AppText variant="caption" color="success">
              Identité vérifiée
            </AppText>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
