import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const MIN_PHOTOS = 4;

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
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      onChange([...uris, ...newUris]);
    }
  }

  function handleRemove(index: number) {
    onChange(uris.filter((_, i) => i !== index));
  }

  const hasEnough = uris.length >= MIN_PHOTOS;
  const remaining = Math.max(0, MIN_PHOTOS - uris.length);

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

        {/* Add button — always visible so user can keep adding */}
        <Pressable
          onPress={handlePick}
          accessibilityRole="button"
          accessibilityLabel="Ajouter des photos"
          style={[
            styles.slot,
            styles.addSlot,
            { borderColor: hasEnough ? C.outlineVariant : C.primary + '88', backgroundColor: C.surfaceContainerLow },
          ]}
        >
          <MaterialIcons
            name="add-photo-alternate"
            size={30}
            color={hasEnough ? C.onSurfaceVariant : C.primary}
          />
          <Text
            style={[
              Typography.caption,
              { color: hasEnough ? C.onSurfaceVariant : C.primary, marginTop: 6, textAlign: 'center' },
            ]}
          >
            {uris.length === 0 ? 'Ajouter des\nphotos' : 'Ajouter'}
          </Text>
        </Pressable>
      </View>

      {/* Counter + minimum progress */}
      <View style={styles.footer}>
        <View style={styles.counterRow}>
          <MaterialIcons
            name={hasEnough ? 'check-circle' : 'photo-library'}
            size={14}
            color={hasEnough ? C.primary : C.onSurfaceVariant}
          />
          <Text style={[Typography.caption, { color: hasEnough ? C.primary : C.onSurfaceVariant }]}>
            {uris.length} photo{uris.length > 1 ? 's' : ''}
            {hasEnough
              ? ` · Minimum atteint`
              : ` · encore ${remaining} photo${remaining > 1 ? 's' : ''} requise${remaining > 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* Progress bar toward minimum */}
        {!hasEnough && (
          <View style={[styles.progressTrack, { backgroundColor: C.surfaceContainerHighest }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: C.primary,
                  width: `${Math.min(100, (uris.length / MIN_PHOTOS) * 100)}%`,
                },
              ]}
            />
          </View>
        )}
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
  footer: {
    gap: Spacing.xs,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
