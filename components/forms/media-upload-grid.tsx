import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MAX_PHOTOS = 4;

interface MediaUploadGridProps {
  uris: string[];
  onChange: (uris: string[]) => void;
}

export function MediaUploadGrid({ uris, onChange }: MediaUploadGridProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  async function handlePick() {
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

  const slots = Array.from({ length: MAX_PHOTOS });

  return (
    <View>
      <View style={styles.grid}>
        {slots.map((_, i) => {
          const uri = uris[i];
          return (
            <View key={i} style={[styles.slot, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }]}>
              {uri ? (
                <>
                  <Image source={{ uri }} style={styles.img} resizeMode="cover" />
                  <Pressable
                    onPress={() => handleRemove(i)}
                    style={[styles.removeBtn, { backgroundColor: C.error }]}
                  >
                    <MaterialIcons name="close" size={14} color="#fff" />
                  </Pressable>
                  {i === 0 && (
                    <View style={[styles.mainBadge, { backgroundColor: C.primary }]}>
                      <Text style={[Typography.caption, { color: C.onPrimary, fontSize: 9 }]}>Principale</Text>
                    </View>
                  )}
                </>
              ) : (
                <Pressable
                  onPress={uris.length < MAX_PHOTOS ? handlePick : undefined}
                  style={styles.addBtn}
                  disabled={uris.length >= MAX_PHOTOS}
                >
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={28}
                    color={uris.length >= MAX_PHOTOS ? C.outlineVariant : C.onSurfaceVariant}
                  />
                  <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 4 }]}>
                    {i === 0 ? 'Photo principale' : `Photo ${i + 1}`}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
      <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: Spacing.sm }]}>
        {uris.length}/{MAX_PHOTOS} photos · La première est la photo principale
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%' },
  addBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
});
