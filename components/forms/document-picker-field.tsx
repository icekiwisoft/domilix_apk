import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Button, pressedStyle } from '@/components/ui';
import { Borders, Opacity, Radii, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
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
  const C = useThemeColors();
  const [error, setError] = useState<string | null>(null);
  const isPdf = value?.mimeType === 'application/pdf';

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setError(null);
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
      setError('Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }
    setError(null);
    onChange({ uri: asset.uri, name: asset.name, mimeType: 'application/pdf' });
  }

  const box = {
    height: Sizes.documentPreview,
    borderRadius: Radii.control,
    borderWidth: Borders.focus,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: C.surfaceContainerLow,
  };

  return (
    <View style={{ gap: Spacing.sm }}>
      <AppText variant="label">{label}</AppText>

      {value ? (
        <View style={[box, { borderColor: C.link }]}>
          {isPdf ? (
            <View style={{ alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md }}>
              <MaterialIcons name="picture-as-pdf" size={Sizes.stateIcon / 2} color={C.error} />
              <AppText numberOfLines={2} style={{ textAlign: 'center' }}>
                {value.name}
              </AppText>
            </View>
          ) : (
            <Image
              source={{ uri: value.uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              accessible
              accessibilityRole="image"
              accessibilityLabel={`${label} : ${value.name}`}
            />
          )}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} : choisir une photo`}
          accessibilityState={{ disabled: !!(disabled || allowPdf) }}
          // With PDF allowed, the two buttons below choose the source.
          disabled={disabled || allowPdf}
          onPress={pickPhoto}
          style={({ pressed }) => [
            box,
            { borderColor: C.outline, borderStyle: 'dashed', opacity: disabled ? Opacity.disabled : 1 },
            pressedStyle(pressed),
          ]}
        >
          <View style={{ alignItems: 'center', gap: Spacing.xs }}>
            <MaterialIcons name="add-photo-alternate" size={Sizes.iconLg} color={C.link} />
            <AppText color="onSurfaceVariant">{allowPdf ? 'Ajouter un document' : 'Choisir une photo'}</AppText>
          </View>
        </Pressable>
      )}

      {!value && allowPdf ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          <Button
            variant="secondary"
            icon="image"
            label="Photo"
            onPress={pickPhoto}
            disabled={disabled}
            style={{ flexGrow: 1 }}
          />
          <Button
            variant="secondary"
            icon="picture-as-pdf"
            label="Fichier PDF"
            onPress={pickPdf}
            disabled={disabled}
            style={{ flexGrow: 1 }}
          />
        </View>
      ) : null}

      {value && !disabled ? (
        <Button
          variant="text"
          icon="delete-outline"
          label={isPdf ? 'Retirer le fichier' : 'Retirer la photo'}
          onPress={() => onChange(null)}
          style={{ alignSelf: 'flex-start', marginLeft: -Spacing.ms }}
        />
      ) : null}
      {error ? (
        <AppText variant="caption" color="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
      {hint ? (
        <AppText variant="caption" color="onSurfaceVariant">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
