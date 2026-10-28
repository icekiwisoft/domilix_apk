import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { MAX_MEDIAS } from '@/constants/listing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PickedMedia } from '@/services/uploads.service';

interface MediaPickerGridProps {
  medias: PickedMedia[];
  onChange: (medias: PickedMedia[]) => void;
  max?: number;
  disabled?: boolean;
  /** Highlight the first media as the listing's main one (default). */
  mainMedia?: boolean;
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
// The first media is the main one; tap another to make it the main media.
export function MediaPickerGrid({ medias, onChange, max = MAX_MEDIAS, disabled, mainMedia = true }: MediaPickerGridProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
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
      onChange([...medias, ...result.assets.map(toPickedMedia)].slice(0, max));
    }
  }

  function makeMain(index: number) {
    if (!mainMedia || index === 0 || disabled) return;
    const next = [...medias];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  }

  function remove(index: number) {
    onChange(medias.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {medias.map((media, i) => (
          <Pressable
            key={`${media.uri}-${i}`}
            accessibilityRole="button"
            accessibilityLabel={!mainMedia ? media.name : i === 0 ? 'Média principal' : 'Définir comme média principal'}
            onPress={() => makeMain(i)}
            style={[
              styles.slot,
              {
                borderColor: mainMedia && i === 0 ? C.primary : C.outlineVariant,
                borderWidth: mainMedia && i === 0 ? 2.5 : 1.5,
                backgroundColor: C.surfaceContainer,
              },
            ]}
          >
            {media.isVideo ? (
              <View style={[styles.img, styles.videoTile, { backgroundColor: C.inverseSurface }]}>
                <MaterialIcons name="play-circle-outline" size={42} color={C.inverseOnSurface} />
                <Text numberOfLines={1} style={[Typography.caption, { color: C.inverseOnSurface, paddingHorizontal: 6 }]}>
                  {media.name}
                </Text>
              </View>
            ) : (
              <Image source={{ uri: media.uri }} style={styles.img} resizeMode="cover" />
            )}

            {!disabled && (
              <IconButton
                icon="close"
                accessibilityLabel="Supprimer ce média"
                onPress={() => remove(i)}
                iconColor={C.onError}
                containerColor={C.error}
                size={13}
                style={styles.removeBtn}
              />
            )}

            {media.isVideo && (
              <View style={[styles.videoBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <MaterialIcons name="videocam" size={14} color="#fff" />
              </View>
            )}

            {mainMedia && i === 0 && (
              <View style={[styles.mainBadge, { backgroundColor: C.primary }]}>
                <MaterialIcons name="star" size={11} color={C.onPrimary} />
                <Text style={[Typography.caption, { color: C.onPrimary, fontSize: 9 }]}>Principal</Text>
              </View>
            )}
          </Pressable>
        ))}

        {!atMax && (
          <Pressable
            onPress={handlePick}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Ajouter des photos ou des vidéos"
            style={[
              styles.slot,
              styles.addSlot,
              { borderColor: C.primary + '88', backgroundColor: C.surfaceContainerLow, opacity: disabled ? 0.5 : 1 },
            ]}
          >
            <MaterialIcons name="cloud-upload" size={30} color={C.primary} />
            <Text style={[Typography.caption, { color: C.primary, marginTop: 6, textAlign: 'center' }]}>
              {medias.length === 0 ? 'Ajouter des médias' : 'Ajouter'}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.counterRow}>
        <MaterialIcons name="photo-library" size={14} color={C.onSurfaceVariant} />
        <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
          {medias.length}/{max} · Images ou vidéos.{mainMedia ? ' Touchez un média pour en faire le média principal.' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  addSlot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  videoTile: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  removeBtn: { position: 'absolute', top: 2, right: 2, margin: 0 },
  videoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
