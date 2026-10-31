import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState, type Ref } from 'react';
import { Pressable, View, type TextInput, type TextInputProps } from 'react-native';

import { AppText, Divider, Field, IconButton, pressedStyle, useScreenKeyboard } from '@/components/ui';
import { Borders, Radii, Shadows, Sizes, Spacing } from '@/constants/theme';
import { useAddressSearch } from '@/hooks/queries/use-addresses';
import { useThemeColors } from '@/hooks/use-theme-color';
import { GeoapifyError, type GeoapifyAddressSuggestion } from '@/services/geoapify.service';

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (suggestion: GeoapifyAddressSuggestion) => void;
  kind?: 'address' | 'city';
  /** Field label; defaults to the website's "Adresse ou repère" / "Ville". */
  label?: string;
  error?: string;
  ref?: Ref<TextInput>;
  /** Keyboard "Suivant" to the next field. */
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
}

/**
 * Address or city field with Geoapify suggestions (B-01) from 3 characters.
 * Suggestions are 48 dp rows under the field (no nested list in the page's
 * ScrollView); a search failure is the field's message, so TalkBack reads it,
 * and typing stays possible (manual entry).
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  kind = 'address',
  label,
  error,
  ref,
  returnKeyType = 'next',
  onSubmitEditing,
}: AddressAutocompleteProps) {
  const C = useThemeColors();
  const [open, setOpen] = useState(false);
  // Search only once the text changed since the field got focus: focusing a
  // field that already holds an address must not spend a Geoapify request.
  const [typed, setTyped] = useState(false);
  const isCity = kind === 'city';
  const keyboard = useScreenKeyboard();
  const listRef = useRef<View>(null);

  const { data: suggestions = [], isFetching, isError, error: searchError } = useAddressSearch(
    value,
    open && typed,
    isCity ? 'city' : undefined,
  );

  const shown = open && typed && suggestions.length > 0;
  // Inside <Screen keyboard>, the list would open under the keyboard.
  useEffect(() => {
    if (shown) keyboard?.revealNode(listRef.current);
  }, [shown, suggestions.length, keyboard]);

  function select(suggestion: GeoapifyAddressSuggestion) {
    const selectedValue = isCity
      ? suggestion.city || suggestion.text || suggestion.place_name
      : suggestion.text || suggestion.place_name;
    onChange(selectedValue);
    onSelect?.(suggestion);
    setOpen(false);
  }

  const searchMessage = isError
    ? searchError instanceof GeoapifyError
      ? searchError.message
      : 'Suggestions indisponibles.'
    : undefined;
  const searching = open && typed && value.trim().length >= 3 && isFetching && suggestions.length === 0;

  return (
    <View style={{ gap: Spacing.xs }}>
      <Field
        ref={ref}
        label={label ?? (isCity ? 'Ville' : 'Adresse ou repère')}
        value={value}
        onChangeText={(t) => {
          onChange(t);
          setTyped(true);
          setOpen(true);
        }}
        onFocus={() => {
          setTyped(false);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={isCity ? 'Ex. Douala' : 'Ex. Bonamoussadi, près du carrefour Maetur'}
        error={error ?? searchMessage}
        helper={searching ? 'Recherche en cours…' : undefined}
        leftIcon={
          <MaterialIcons
            name={isCity ? 'location-city' : 'location-on'}
            size={Sizes.icon}
            color={C.onSurfaceVariant}
          />
        }
        rightElement={
          value.length > 0 ? (
            <IconButton
              icon="close"
              label={isCity ? 'Effacer la ville' : "Effacer l'adresse"}
              color="onSurfaceVariant"
              onPress={() => {
                onChange('');
                setOpen(false);
              }}
            />
          ) : undefined
        }
        returnKeyType={returnKeyType}
        submitBehavior={onSubmitEditing ? 'submit' : 'blurAndSubmit'}
        onSubmitEditing={onSubmitEditing}
        autoCorrect={false}
      />
      {shown ? (
        <View
          ref={listRef}
          collapsable={false}
          accessibilityLabel={`${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''}`}
          style={[
            {
              borderWidth: Borders.thin,
              borderColor: C.outlineVariant,
              borderRadius: Radii.control,
              overflow: 'hidden',
              backgroundColor: C.surfaceContainerLowest,
            },
            Shadows.xs,
          ]}
        >
          {suggestions.map((item, i) => (
            <View key={item.id}>
              {i > 0 ? <Divider /> : null}
              <Pressable
                onPress={() => select(item)}
                accessibilityRole="button"
                accessibilityLabel={item.place_name}
                style={({ pressed }) => [
                  {
                    minHeight: Sizes.touchTarget,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing.sm,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                  },
                  pressedStyle(pressed),
                ]}
              >
                <MaterialIcons name="place" size={Sizes.iconSm} color={C.onSurfaceVariant} />
                <AppText style={{ flex: 1 }}>{item.place_name}</AppText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
