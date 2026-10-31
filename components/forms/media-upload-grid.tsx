import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Badge, IconButton, pressedStyle } from '@/components/ui';
import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

// Tiles of the listing media grids (create step 3, edit screen). The picker
// itself is MediaPickerGrid (media-picker-grid.tsx).

/** Two square tiles per row, the Spacing.sm gap between them included. */
const TILE: { width: `${number}%`; aspectRatio: number } = { width: '48%', aspectRatio: 1 };

export interface PhotoTileProps {
  /** Image (or video thumbnail) to show; a local video has none. */
  uri?: string;
  /** A video: play icon over the thumbnail, or on a dark tile without one. */
  video?: boolean;
  /** Under the play icon of a video without thumbnail (file name). */
  caption?: string;
  /** Position read by TalkBack, e.g. "Photo 2". */
  label: string;
  /** "Principale", "Nouvelle". */
  badge?: string;
  onRemove?: () => void;
  /** Tap on the tile (e.g. make it the main media). */
  onPress?: () => void;
  /** TalkBack hint of `onPress`. */
  pressLabel?: string;
}

/** One picked or existing photo or video, with a 48 dp remove button over its corner. */
export function PhotoTile({ uri, video, caption, label, badge, onRemove, onPress, pressLabel }: PhotoTileProps) {
  const C = useThemeColors();
  return (
    <View
      style={[
        TILE,
        {
          borderRadius: Radii.control,
          overflow: 'hidden',
          borderWidth: Borders.thin,
          borderColor: C.outlineVariant,
          backgroundColor: C.surfaceContainer,
        },
      ]}
    >
      <Pressable
        disabled={!onPress}
        onPress={onPress}
        accessibilityRole={onPress ? 'button' : 'image'}
        accessibilityLabel={badge ? `${label}, ${badge.toLowerCase()}` : label}
        accessibilityHint={pressLabel}
        style={({ pressed }) => [{ flex: 1 }, onPress ? pressedStyle(pressed) : null]}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.xs,
              padding: Spacing.sm,
              backgroundColor: C.inverseSurface,
            }}
          >
            <MaterialIcons name="play-circle-outline" size={Sizes.iconLg} color={C.inverseOnSurface} />
            {caption ? (
              <AppText variant="caption" color="inverseOnSurface" numberOfLines={1}>
                {caption}
              </AppText>
            ) : null}
          </View>
        )}
        {video && uri ? (
          <View
            importantForAccessibility="no-hide-descendants"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="play-circle-outline" size={Sizes.iconLg} color={C.inverseOnSurface} />
          </View>
        ) : null}
      </Pressable>
      {onRemove ? (
        <IconButton
          icon="close"
          label={`Supprimer ${label.toLowerCase()}`}
          overlay
          onPress={onRemove}
          style={{ position: 'absolute', top: Spacing.xs, right: Spacing.xs }}
        />
      ) : null}
      {badge ? (
        <Badge
          label={badge}
          variant="primary"
          status
          style={{ position: 'absolute', bottom: Spacing.sm, left: Spacing.sm }}
        />
      ) : null}
    </View>
  );
}

/** Dashed "Ajouter des photos" tile that opens the system photo picker. */
export function AddPhotoTile({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const C = useThemeColors();
  // The square comes from a plain View: aspectRatio on the Pressable itself
  // left the tile shorter than its row on Android (seen on the emulator).
  return (
    <View style={TILE}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        accessibilityLabel="Ajouter des photos ou des vidéos"
        style={({ pressed }) => [
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.xs,
            padding: Spacing.sm,
            borderRadius: Radii.control,
            borderWidth: Borders.focus,
            borderStyle: 'dashed',
            borderColor: C.outline,
            backgroundColor: C.surfaceContainerLow,
          },
          pressedStyle(pressed),
        ]}
      >
        <MaterialIcons name="add-photo-alternate" size={Sizes.iconLg} color={C.link} />
        <AppText variant="label" color="link" style={{ textAlign: 'center' }}>
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}

/** Wrapping two-column grid of PhotoTile / AddPhotoTile. */
export function PhotoGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>{children}</View>;
}
