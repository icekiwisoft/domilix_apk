import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAddressSearch } from '@/hooks/queries/use-addresses';

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function AddressAutocomplete({ value, onChange, error }: AddressAutocompleteProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [open, setOpen] = useState(false);

  const { data: suggestions = [] } = useAddressSearch(value, open);

  function select(placeName: string) {
    onChange(placeName);
    setOpen(false);
  }

  return (
    <View>
      <View style={[styles.inputRow, { borderColor: error ? C.error : C.outlineVariant, backgroundColor: C.surfaceContainerLow }]}>
        <MaterialIcons name="location-on" size={18} color={C.onSurfaceVariant} />
        <TextInput
          value={value}
          onChangeText={(t) => { onChange(t); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Quartier, rue…"
          placeholderTextColor={C.onSurfaceVariant}
          style={[Typography.bodyMd, { flex: 1, color: C.onSurface, paddingVertical: 0 }]}
          returnKeyType="done"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => onChange('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Effacer l'adresse"
          >
            <MaterialIcons name="close" size={16} color={C.onSurfaceVariant} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={[Typography.caption, { color: C.error, marginTop: 4 }]}>{error}</Text>
      )}
      {open && suggestions.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => select(item.place_name)}
                accessibilityRole="button"
                accessibilityLabel={item.place_name}
                style={[styles.suggestion, { borderBottomColor: C.outlineVariant + '4D' }]}
              >
                <MaterialIcons name="place" size={16} color={C.onSurfaceVariant} />
                <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1 }]}>{item.place_name}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: Radius.md,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
});
