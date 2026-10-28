import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PickedFile } from '@/services/uploads.service';

interface DocumentPickerFieldProps {
  label: string;
  hint?: string;
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  disabled?: boolean;
  /** Also offer a PDF picker (student card, receipt). */
  allowPdf?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;

function toPickedFile(asset: ImagePicker.ImagePickerAsset): PickedFile {
  const fallbackName = asset.uri.split('/').pop() ?? 'document.jpg';
  return {
    uri: asset.uri,
    name: asset.fileName ?? fallbackName,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

// Proof-document picker (ID card, student card, receipt). Photos come from the
// gallery; PDFs from the system file picker. The backend validates the real
// file signature and size (10 Mo max).
export function DocumentPickerField({ label, hint, value, onChange, disabled, allowPdf }: DocumentPickerFieldProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const isPdf = value?.mimeType === 'application/pdf';

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onChange(toPickedFile(result.assets[0]));
    }
  }

  async function pickPdf() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.size != null && asset.size > MAX_BYTES) {
      Alert.alert('Fichier trop volumineux', 'Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }
    onChange({ uri: asset.uri, name: asset.name, mimeType: 'application/pdf' });
  }

  return (
    <View style={styles.wrapper}>
      <Text style={[Typography.labelSm, { color: C.onSurface }]}>{label}</Text>

      {value ? (
        <View style={[styles.box, { backgroundColor: C.surface, borderColor: C.primary }]}>
          {isPdf ? (
            <View style={styles.placeholder}>
              <MaterialIcons name="picture-as-pdf" size={40} color={C.error} />
              <Text
                numberOfLines={2}
                style={[Typography.bodyMd, { color: C.onSurface, textAlign: 'center', paddingHorizontal: Spacing.md }]}
              >
                {value.name}
              </Text>
            </View>
          ) : (
            <Image source={{ uri: value.uri }} style={styles.preview} resizeMode="cover" />
          )}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} : choisir une photo`}
          disabled={disabled || allowPdf}
          onPress={pickPhoto}
          style={[
            styles.box,
            { backgroundColor: C.surface, borderColor: C.outlineVariant, opacity: disabled ? 0.6 : 1, borderStyle: 'dashed' },
          ]}
        >
          <View style={styles.placeholder}>
            <MaterialIcons name="add-photo-alternate" size={34} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
              {allowPdf ? 'Ajouter un document' : 'Choisir une photo'}
            </Text>
          </View>
        </Pressable>
      )}

      {!value && allowPdf && (
        <View style={styles.actions}>
          <Button mode="outlined" icon="image-outline" onPress={pickPhoto} disabled={disabled} style={styles.action}>
            Photo
          </Button>
          <Button mode="outlined" icon="file-pdf-box" onPress={pickPdf} disabled={disabled} style={styles.action}>
            Fichier PDF
          </Button>
        </View>
      )}

      {value && !disabled && (
        <Pressable onPress={() => onChange(null)} hitSlop={8} accessibilityRole="button">
          <Text style={[Typography.caption, { color: C.error }]}>
            {isPdf ? 'Retirer le fichier' : 'Retirer la photo'}
          </Text>
        </Pressable>
      )}
      {hint && <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  box: {
    height: 160,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: Spacing.xs },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  action: { flex: 1 },
});
