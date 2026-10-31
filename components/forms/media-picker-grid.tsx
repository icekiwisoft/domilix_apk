import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { MAX_MEDIAS } from '@/constants/listing';
import { Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { coverFirst } from '@/lib/listing-payload';
import type { PickedMedia } from '@/services/uploads.service';

import { AddPhotoTile, PhotoGrid, PhotoTile } from './media-upload-grid';

interface MediaPickerGridProps {
  medias: PickedMedia[];
  onChange: (medias: PickedMedia[]) => void;
  max?: number;
  disabled?: boolean;
  /** Highlight the first media as the listing's main one (default). */
  mainMedia?: boolean;
  /** Number shown on the first tile ("Photo 3"): existing medias come first on the edit screen. */
  offset?: number;
}

function toPickedMedia(asset: ImagePicker.ImagePickerAsset): PickedMedia {
  const isVideo = asset.type === 'video' || (asset.mimeType ?? '').startsWith('video/');
  const fallbackName = asset.uri.split('/').pop() ?? (isVideo ? 'video.mp4' : 'photo.jpg');
  return {
    uri: asset.uri,
    name: asset.fileName ?? fallbackName,
    mimeType: asset.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg'),
    isVideo,
  };
}

// Photos and videos of a listing (same limits as the website: 15 medias).
// The first media is the main one (cover): a photo whenever there is one, since
// a video has no thumbnail (QA-32). Tap another photo to make it the cover.
export function MediaPickerGrid({
  medias,
  onChange,
  max = MAX_MEDIAS,
  disabled,
  mainMedia = true,
  offset = 0,
}: MediaPickerGridProps) {
  const C = useThemeColors();
  const atMax = medias.length >= max;

  async function handlePick() {
    if (atMax || disabled) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: max - medias.length,
    });
    if (!result.canceled) {
      const next = [...medias, ...result.assets.map(toPickedMedia)].slice(0, max);
      onChange(mainMedia ? coverFirst(next, (m) => m.isVideo) : next);
    }
  }

  function makeMain(index: number) {
    if (!mainMedia || index === 0 || disabled || medias[index].isVideo) return;
    const next = [...medias];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  }

  function remove(index: number) {
    const next = medias.filter((_, i) => i !== index);
    onChange(mainMedia ? coverFirst(next, (m) => m.isVideo) : next);
  }

  return (
    <View style={{ gap: Spacing.sm }}>
      <PhotoGrid>
        {medias.map((media, i) => {
          const isMain = mainMedia && i === 0;
          return (
            <PhotoTile
              key={`${media.uri}-${i}`}
              uri={media.isVideo ? undefined : media.uri}
              video={media.isVideo}
              caption={media.name}
              label={`${media.isVideo ? 'Vidéo' : 'Photo'} ${offset + i + 1}`}
              badge={isMain ? 'Principale' : mainMedia ? undefined : 'Nouvelle'}
              onRemove={disabled ? undefined : () => remove(i)}
              onPress={mainMedia && i > 0 && !disabled && !media.isVideo ? () => makeMain(i) : undefined}
              pressLabel="Définir comme média principal"
            />
          );
        })}
        {!atMax ? (
          <AddPhotoTile
            label={medias.length === 0 ? 'Ajouter des photos ou vidéos' : 'Ajouter'}
            onPress={handlePick}
            disabled={disabled}
          />
        ) : null}
      </PhotoGrid>

      <View
        accessible
        accessibilityLiveRegion="polite"
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}
      >
        <MaterialIcons name="photo-library" size={Sizes.iconSm} color={C.onSurfaceVariant} />
        <AppText variant="caption" color="onSurfaceVariant" style={{ flex: 1 }}>
          {`${medias.length}/${max} · Images ou vidéos.${mainMedia ? ' Touchez une photo pour en faire la photo principale.' : ''}`}
        </AppText>
      </View>
    </View>
  );
}
