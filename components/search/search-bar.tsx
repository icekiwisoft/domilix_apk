import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher un quartier, un type…',
  onFilterPress,
  onSubmitEditing,
  autoFocus,
}: SearchBarProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={styles.row}>
      <View style={[styles.inputWrapper, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
        <MaterialIcons name="search" size={20} color={C.onSurfaceVariant} style={styles.searchIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.onSurfaceVariant}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          style={[
            Typography.bodyMd,
            styles.input,
            { color: C.onSurface },
          ]}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={C.onSurfaceVariant} />
          </Pressable>
        )}
      </View>
      {onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          style={[styles.filterBtn, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}
        >
          <MaterialIcons name="tune" size={20} color={C.onSurface} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
