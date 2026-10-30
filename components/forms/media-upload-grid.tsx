import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Badge, IconButton, pressedStyle } from '@/components/ui';
import { Borders, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

export const MAX_PHOTOS = 10;

/** Two square tiles per row, the Spacing.sm gap between them included. */
const TILE: { width: `${number}%`; aspectRatio: number } = { width: '48%', aspectRatio: 1 };

export interface PhotoTileProps {
  uri: string;
  /** Position read by TalkBack, e.g. "Photo 2". */
  label: string;
  /** "Principale", "Nouvelle". */
  badge?: string;
  onRemove: () => void;
}

/** One picked or existing photo, with a 48 dp remove button over its corner. */
export function PhotoTile({ uri, label, badge, onRemove }: PhotoTileProps) {
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
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        accessible
        accessibilityRole="image"
        accessibilityLabel={badge ? `${label}, ${badge.toLowerCase()}` : label}
      />
      <IconButton
        icon="close"
        label={`Supprimer ${label.toLowerCase()}`}
        overlay
        onPress={onRemove}
        style={{ position: 'absolute', top: Spacing.xs, right: Spacing.xs }}
      />
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
export function AddPhotoTile({ label, onPress }: { label: string; onPress: () => void }) {
  const C = useThemeColors();
  // The square comes from a plain View: aspectRatio on the Pressable itself
  // left the tile shorter than its row on Android (seen on the emulator).
  return (
    <View style={TILE}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Ajouter des photos"
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

interface MediaUploadGridProps {
  uris: string[];
  onChange: (uris: string[]) => void;
}

/** Photos of a new listing (create step 5), up to MAX_PHOTOS, the first one the main photo. */
export function MediaUploadGrid({ uris, onChange }: MediaUploadGridProps) {
  const C = useThemeColors();
  const atMax = uris.length >= MAX_PHOTOS;

  async function handlePick() {
    if (atMax) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - uris.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      onChange([...uris, ...newUris].slice(0, MAX_PHOTOS));
    }
  }

  function handleRemove(index: number) {
    onChange(uris.filter((_, i) => i !== index));
  }

  return (
    <View style={{ gap: Spacing.sm }}>
      <PhotoGrid>
        {uris.map((uri, i) => (
          <PhotoTile
            key={`${uri}-${i}`}
            uri={uri}
            label={`Photo ${i + 1}`}
            badge={i === 0 ? 'Principale' : undefined}
            onRemove={() => handleRemove(i)}
          />
        ))}
        {/* Hidden once the max is reached */}
        {!atMax ? <AddPhotoTile label={uris.length === 0 ? 'Ajouter des photos' : 'Ajouter'} onPress={handlePick} /> : null}
      </PhotoGrid>

      <View
        accessible
        accessibilityLiveRegion="polite"
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}
      >
        <MaterialIcons name="photo-library" size={Sizes.iconSm} color={C.onSurfaceVariant} />
        <AppText variant="caption" color="onSurfaceVariant">
          {`${uris.length}/${MAX_PHOTOS} photos`}
        </AppText>
      </View>
    </View>
  );
}
