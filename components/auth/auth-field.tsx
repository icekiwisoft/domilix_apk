import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Radius, Sizes, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AuthFieldProps extends TextInputProps {
  label: string;
  /** Extra text after the label, in a lighter weight, e.g. "(facultatif)". */
  labelHint?: string;
  /** Element aligned right on the label row, e.g. "Mot de passe oublié ?". */
  labelAction?: ReactNode;
  error?: string;
  /** Text under the field when there is no error. */
  helper?: ReactNode;
  leftIcon?: ReactNode;
  /** Fixed prefix inside the field, separated by a border (e.g. +237). */
  prefix?: ReactNode;
  rightElement?: ReactNode;
}

/** Labelled text field of the sign-in and sign-up screens (label above, 52 dp box). */
export const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField(
  { label, labelHint, labelAction, error, helper, leftIcon, prefix, rightElement, onFocus, onBlur, style, ...rest },
  ref,
) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [focused, setFocused] = useState(false);

  const borderColor = error ? C.error : focused ? C.link : C.outline;
  const borderWidth = error || focused ? 2 : 1;

  return (
    <View style={styles.group}>
      <View style={styles.labelRow}>
        <Text style={[Typography.labelMd, styles.label, { color: C.onSurface }]}>
          {label}
          {labelHint ? (
            <Text style={[Typography.bodySm, { color: C.onSurfaceVariant }]}>{` ${labelHint}`}</Text>
          ) : null}
        </Text>
        {labelAction}
      </View>
      <View
        style={[
          styles.box,
          {
            backgroundColor: C.fieldSurface,
            borderColor,
            borderWidth,
            // Keep the content still when the border thickens.
            paddingLeft: prefix ? 0 : Spacing.md - (borderWidth - 1),
            paddingRight: rightElement ? Spacing.xs - (borderWidth - 1) : Spacing.md - (borderWidth - 1),
          },
        ]}
      >
        {prefix ? (
          <View style={[styles.prefix, { backgroundColor: C.fieldPrefix, borderRightColor: C.outline }]}>
            {prefix}
          </View>
        ) : null}
        {leftIcon}
        <TextInput
          ref={ref}
          style={[
            Typography.bodyMd,
            styles.input,
            { color: C.onSurface, paddingLeft: prefix ? Spacing.md : 0 },
            style,
          ]}
          placeholderTextColor={C.outline}
          selectionColor={C.primary}
          cursorColor={C.primary}
          accessibilityLabel={labelHint ? `${label} ${labelHint}` : label}
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
        {rightElement}
      </View>
      {error ? (
        <Text style={[Typography.helper, { color: C.error }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        helper
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  label: {
    flexShrink: 1,
  },
  box: {
    minHeight: Sizes.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  prefix: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRightWidth: 1,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Spacing.sm,
    margin: 0,
  },
});
