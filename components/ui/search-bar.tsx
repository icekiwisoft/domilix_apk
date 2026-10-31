import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Borders, Radii, Shadows, Sizes, Spacing, TextVariants } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { pressedStyle } from './pressed';

export interface SearchBarProps
  extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText' | 'placeholder'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Shorter hint used from 130 % font size, where the long one is cut. */
  shortPlaceholder?: string;
  /** Read by TalkBack for the field. */
  label?: string;
  /** Shows the amber filter button when given. */
  onFilterPress?: () => void;
  /** Number of active filters, shown as a badge on the filter button. */
  filterCount?: number;
  /** Shadow under the field and the button, when they sit over a map. */
  floating?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** fontScale from which the short placeholder is used. */
const SHORT_HINT_SCALE = 1.3;

/**
 * Search field (52 dp, search icon, clear button) with an optional square
 * filter button and its active-filter count. The focus ring is the 2 dp
 * `link` ring of Field. Contrast: outline border 4.48:1, onCta on cta 8.5:1,
 * the count primaryFixed on onPrimaryFixed 12:1 (both themes).
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Quartier, ville, type de bien…',
  shortPlaceholder = 'Rechercher…',
  label = 'Rechercher une annonce',
  onFilterPress,
  filterCount = 0,
  floating = false,
  style,
  onFocus,
  onBlur,
  ...rest
}: SearchBarProps) {
  const C = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  const ring = focused ? Borders.focus : Borders.thin;
  const filterLabel =
    filterCount > 0 ? `Filtres, ${filterCount} actif${filterCount > 1 ? 's' : ''}` : 'Filtres';

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, style]}>
      <View
        style={[
          {
            flex: 1,
            minHeight: Sizes.control,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            borderRadius: Radii.control,
            backgroundColor: C.fieldSurface,
            borderWidth: ring,
            borderColor: focused ? C.link : C.outline,
            // Keep the text still when the border thickens.
            paddingLeft: Spacing.ms - (ring - Borders.thin),
          },
          floating ? Shadows.md : null,
        ]}
      >
        <MaterialIcons name="search" size={Sizes.icon} color={C.onSurfaceVariant} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={fontScale > SHORT_HINT_SCALE ? shortPlaceholder : placeholder}
          placeholderTextColor={C.placeholder}
          selectionColor={C.primary}
          cursorColor={C.primary}
          returnKeyType="search"
          accessibilityLabel={label}
          style={[
            TextVariants.body,
            {
              flex: 1,
              minWidth: 0,
              minHeight: Sizes.touchTarget,
              margin: 0,
              paddingVertical: Spacing.sm,
              paddingRight: value ? 0 : Spacing.ms,
              color: C.onSurface,
            },
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {value ? (
          <IconButton icon="close" label="Effacer la recherche" color="onSurfaceVariant" onPress={() => onChangeText('')} />
        ) : null}
      </View>
      {onFilterPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={filterLabel}
          onPress={onFilterPress}
          style={({ pressed }) => [
            {
              width: Sizes.control,
              height: Sizes.control,
              borderRadius: Radii.control,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.cta,
            },
            floating ? Shadows.md : null,
            pressedStyle(pressed),
          ]}
        >
          <MaterialIcons name="tune" size={Sizes.iconLg} color={C.onCta} />
          {filterCount > 0 ? (
            <View
              importantForAccessibility="no-hide-descendants"
              style={{
                position: 'absolute',
                top: -Spacing.xs,
                right: -Spacing.xs,
                minWidth: Sizes.countBadge,
                minHeight: Sizes.countBadge,
                paddingHorizontal: Spacing.xs,
                borderRadius: Radii.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: C.onPrimaryFixed,
              }}
            >
              <AppText variant="caption" color="primaryFixed">
                {String(filterCount)}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}
