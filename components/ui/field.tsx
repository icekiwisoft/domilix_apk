import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Borders, Radii, Sizes, Spacing, TextVariants } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { useScreenKeyboard } from './screen';

export interface FieldProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  /** Lighter text after the label, e.g. "(facultatif)". */
  labelHint?: string;
  /** Element aligned right on the label row, e.g. "Mot de passe oublié ?". */
  labelAction?: ReactNode;
  /** Text under the field when there is no error. */
  helper?: string;
  error?: string;
  /** Fixed prefix inside the field, separated by a border (e.g. +237). */
  prefix?: ReactNode;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  /** Password field with a 48 dp show / hide button. */
  secure?: boolean;
  ref?: Ref<TextInput>;
}

/**
 * Labelled text field (label above, 52 dp box), generalised from the
 * sign-in field of lot 2: `link` focus ring and `error` ring of 2 dp, the
 * outline at 1 dp otherwise (4.48:1, above the 3:1 for control borders). Inside a
 * `<Screen keyboard>`, focusing it keeps the main button above the keyboard.
 */
export function Field({
  label,
  labelHint,
  labelAction,
  helper,
  error,
  prefix,
  leftIcon,
  rightElement,
  secure = false,
  ref,
  onFocus,
  onBlur,
  style,
  ...rest
}: FieldProps) {
  const C = useThemeColors();
  const keyboard = useScreenKeyboard();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const ring = !!error || focused;
  const borderWidth = ring ? Borders.focus : Borders.thin;
  // Keep the text still when the border thickens.
  const inset = ring ? Spacing.md - Borders.thin : Spacing.md;
  const trailing = secure ? (
    <IconButton
      icon={hidden ? 'visibility' : 'visibility-off'}
      label={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
      color="onSurfaceVariant"
      onPress={() => setHidden((h) => !h)}
    />
  ) : (
    rightElement
  );

  return (
    <View style={{ gap: Spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: Spacing.sm,
        }}
      >
        <AppText variant="label" style={{ flexShrink: 1 }}>
          {label}
          {labelHint ? <AppText variant="caption" color="onSurfaceVariant">{` ${labelHint}`}</AppText> : null}
        </AppText>
        {labelAction}
      </View>
      <View
        style={{
          minHeight: Sizes.control,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          borderRadius: Radii.control,
          overflow: 'hidden',
          backgroundColor: C.fieldSurface,
          borderWidth,
          borderColor: error ? C.error : focused ? C.link : C.outline,
          paddingLeft: prefix ? 0 : inset,
          paddingRight: trailing ? 0 : inset,
        }}
      >
        {prefix ? (
          <View
            style={{
              alignSelf: 'stretch',
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.xs,
              paddingHorizontal: Spacing.ms,
              backgroundColor: C.fieldPrefix,
              borderRightWidth: Borders.thin,
              borderRightColor: C.outline,
            }}
          >
            {prefix}
          </View>
        ) : null}
        {leftIcon}
        <TextInput
          ref={ref}
          style={[
            TextVariants.body,
            { flex: 1, minWidth: 0, margin: 0, paddingVertical: Spacing.sm, color: C.onSurface },
            style,
          ]}
          placeholderTextColor={C.outline}
          selectionColor={C.primary}
          cursorColor={C.primary}
          secureTextEntry={secure && hidden}
          accessibilityLabel={labelHint ? `${label} ${labelHint}` : label}
          accessibilityHint={error ?? helper}
          onFocus={(e) => {
            setFocused(true);
            keyboard?.revealOnFocus();
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailing}
      </View>
      {error ? (
        <AppText variant="caption" color="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color="onSurfaceVariant">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}
