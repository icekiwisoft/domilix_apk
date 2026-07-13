import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const MAX_PHOTOS = 10;

interface MediaUploadGridProps {
  uris: string[];
  onChange: (uris: string[]) => void;
}

export function MediaUploadGrid({ uris, onChange }: MediaUploadGridProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
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
    <View style={styles.container}>
      {/* Grid: photos + add button */}
      <View style={styles.grid}>
        {uris.map((uri, i) => (
          <View
            key={`${uri}-${i}`}
            style={[styles.slot, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }]}
          >
            <Image source={{ uri }} style={styles.img} resizeMode="cover" />

            <IconButton
              icon="close"
              accessibilityLabel="Supprimer cette photo"
              onPress={() => handleRemove(i)}
              iconColor={C.onError}
              containerColor={C.error}
              size={13}
              style={styles.removeBtn}
            />

            {i === 0 && (
              <View style={[styles.mainBadge, { backgroundColor: C.primary }]}>
                <Text style={[Typography.caption, { color: C.onPrimary, fontSize: 9 }]}>
                  Principale
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Add button — hidden once the max is reached */}
        {!atMax && (
          <Pressable
            onPress={handlePick}
            accessibilityRole="button"
            accessibilityLabel="Ajouter des photos"
            style={[
              styles.slot,
              styles.addSlot,
              { borderColor: C.primary + '88', backgroundColor: C.surfaceContainerLow },
            ]}
          >
            <MaterialIcons name="add-photo-alternate" size={30} color={C.primary} />
            <Text
              style={[
                Typography.caption,
                {
                  color: C.primary,
                  marginTop: 6,
                  textAlign: 'center',
                  includeFontPadding: false,
                },
              ]}
            >
              {uris.length === 0 ? 'Ajouter des\nphotos' : 'Ajouter'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Counter */}
      <View style={styles.counterRow}>
        <MaterialIcons name="photo-library" size={14} color={C.onSurfaceVariant} />
        <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
          {uris.length}/{MAX_PHOTOS} photos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slot: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  addSlot: {
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    margin: 0,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
