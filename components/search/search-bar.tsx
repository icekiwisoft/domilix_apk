import { StyleSheet, View } from 'react-native';
import { IconButton, Searchbar } from 'react-native-paper';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PaperDarkTheme, PaperLightTheme } from '@/constants/paper-theme';

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
  placeholder = 'Quartier, ville, type de bien…',
  onFilterPress,
  onSubmitEditing,
  autoFocus,
}: SearchBarProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? PaperDarkTheme : PaperLightTheme;
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={styles.row}>
      <Searchbar
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        searchAccessibilityLabel="Rechercher"
        clearAccessibilityLabel="Effacer la recherche"
        style={[styles.inputWrapper, { backgroundColor: C.surfaceContainerLowest }]}
        theme={theme}
      />

      {onFilterPress && (
        <IconButton
          icon="tune"
          mode="contained"
          size={22}
          accessibilityLabel="Filtrer les résultats"
          onPress={onFilterPress}
          containerColor={theme.colors.primary}
          iconColor={theme.colors.onPrimary}
          style={[styles.filterBtn, Shadows.button]}
        />
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
    borderRadius: Radius.full,
    ...Shadows.xs,
  },
  filterBtn: {
    margin: 0,
    borderRadius: Radius.full,
  },
});
