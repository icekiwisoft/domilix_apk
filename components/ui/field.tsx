import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

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
  /**
   * Custom content under the field when there is no error, in place of
   * `helper` (e.g. a password rule with a check icon that updates as you type).
   */
  helperContent?: ReactNode;
  error?: string;
  /** Fixed prefix inside the field, separated by a border (e.g. +237). */
  prefix?: ReactNode;
  /** Fixed unit after the text, separated by a border (e.g. m², FCFA). */
  suffix?: ReactNode;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  /** Password field with a 48 dp show / hide button. */
  secure?: boolean;
  ref?: Ref<TextInput>;
  /** Style of the wrapper (label, box and message), e.g. a margin or flex. */
  containerStyle?: StyleProp<ViewStyle>;
  /** `style` applies to the TextInput itself (text alignment, etc.). */
  style?: TextInputProps['style'];
}

function Adornment({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  const C = useThemeColors();
  return (
    <View
      style={{
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.ms,
        backgroundColor: C.fieldPrefix,
        [side === 'left' ? 'borderRightWidth' : 'borderLeftWidth']: Borders.thin,
        [side === 'left' ? 'borderRightColor' : 'borderLeftColor']: C.outline,
      }}
    >
      {typeof children === 'string' ? (
        <AppText variant="label" color="onSurfaceVariant">
          {children}
        </AppText>
      ) : (
        children
      )}
    </View>
  );
}

/**
 * Labelled text field (label above, 52 dp box), generalised from the
 * sign-in field of lot 2: `link` focus ring and `error` ring of 2 dp, the
 * outline at 1 dp otherwise (4.48:1, above the 3:1 for control borders);
 * placeholder in the `placeholder` token (AA as text). Inside a
 * `<Screen keyboard>`, focusing it keeps the main button above the keyboard.
 *
 * TalkBack: the visible label is hidden from it (the input carries the label,
 * so it is read once); the message line stays mounted as a polite live region
 * and only its text changes, so a new error is announced as "Erreur : …".
 * `secure` defaults to password autofill and no capitalisation; `multiline`
 * aligns the text at the top of a taller box.
 */
export function Field({
  label,
  labelHint,
  labelAction,
  helper,
  helperContent,
  error,
  prefix,
  suffix,
  leftIcon,
  rightElement,
  secure = false,
  ref,
  onFocus,
  onBlur,
  style,
  containerStyle,
  multiline,
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
  const message = error ? `Erreur : ${error}` : (helper ?? '');
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
  const secureDefaults: Partial<TextInputProps> = secure
    ? { autoComplete: 'password', autoCapitalize: 'none', textContentType: 'password', autoCorrect: false }
    : {};

  return (
    <View style={[{ gap: Spacing.xs }, containerStyle]}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: Spacing.sm,
        }}
      >
        {/* Read once, by the input; the label action stays reachable. */}
        <AppText
          variant="label"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={{ flexShrink: 1 }}
        >
          {label}
          {labelHint ? <AppText variant="caption" color="onSurfaceVariant">{` ${labelHint}`}</AppText> : null}
        </AppText>
        {labelAction}
      </View>
      <View
        style={{
          minHeight: multiline ? Sizes.multiline : Sizes.control,
          flexDirection: 'row',
          alignItems: multiline ? 'stretch' : 'center',
          gap: Spacing.sm,
          borderRadius: Radii.control,
          overflow: 'hidden',
          backgroundColor: C.fieldSurface,
          borderWidth,
          borderColor: error ? C.error : focused ? C.link : C.outline,
          paddingLeft: prefix ? 0 : inset,
          paddingRight: trailing || suffix ? 0 : inset,
        }}
      >
        {prefix ? <Adornment side="left">{prefix}</Adornment> : null}
        {leftIcon}
        <TextInput
          ref={ref}
          style={[
            TextVariants.body,
            // The EditText itself is the touch target: 48 dp even though the
            // text line alone is shorter (fits the 52 dp box inside a 2 dp ring).
            { flex: 1, minWidth: 0, minHeight: Sizes.touchTarget, margin: 0, paddingVertical: Spacing.sm, color: C.onSurface },
            multiline ? { textAlignVertical: 'top', paddingVertical: Spacing.ms } : null,
            style,
          ]}
          multiline={multiline}
          placeholderTextColor={C.placeholder}
          selectionColor={C.primary}
          cursorColor={C.primary}
          secureTextEntry={secure && hidden}
          accessibilityLabel={labelHint ? `${label} ${labelHint}` : label}
          accessibilityHint={message || undefined}
          {...secureDefaults}
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
        {suffix ? <Adornment side="right">{suffix}</Adornment> : null}
        {trailing}
      </View>
      {/* Always mounted: TalkBack announces a live region when its text changes. */}
      <View accessibilityLiveRegion="polite">
        {!error && helperContent ? (
          helperContent
        ) : message ? (
          <AppText
            variant="caption"
            color={error ? 'error' : 'onSurfaceVariant'}
            accessibilityLabel={message}
          >
            {error || helper}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
