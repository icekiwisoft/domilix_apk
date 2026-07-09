import { useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Spacing, Typography } from '@/constants/theme';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const refs = useRef<(TextInput | null)[]>([]);

  const surface = useThemeColor({}, 'surface');
  const primary = useThemeColor({}, 'primary');
  const outlineVariant = useThemeColor({}, 'outlineVariant');
  const onSurface = useThemeColor({}, 'onSurface');
  const errorColor = useThemeColor({}, 'error');
  const surfaceContainer = useThemeColor({}, 'surfaceContainer');

  const digits = value.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH).split('');

  function handleChange(text: string, index: number) {
    // Handle paste: text.length > 1
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      refs.current[nextIndex]?.focus();
      return;
    }
    const digit = text.replace(/\D/g, '');
    const next = digits.map((d, i) => (i === index ? digit : d));
    const newValue = next.join('').replace(/ /g, '');
    onChange(newValue);
    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const next = digits.map((d, i) => (i === index - 1 ? '' : d));
      onChange(next.join('').replace(/ /g, ''));
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => {
        const isFocusedSlot = false; // focus state tracked by native
        const borderColor = error ? errorColor : digit ? primary : outlineVariant;
        const borderWidth = digit ? 2 : 1;
        return (
          <TextInput
            key={index}
            ref={(r) => { refs.current[index] = r; }}
            accessibilityLabel={`Chiffre ${index + 1} du code`}
            style={[
              styles.cell,
              {
                backgroundColor: digit ? surfaceContainer : surface,
                borderColor,
                borderWidth,
                color: onSurface,
              },
            ]}
            value={digit === ' ' ? '' : digit}
            onChangeText={(t) => handleChange(t, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            textContentType="oneTimeCode"
            selectTextOnFocus
            caretHidden
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 56,
    borderRadius: Radius.md,
    textAlign: 'center',
    ...Typography.headlineMd,
    fontSize: 22,
  },
});
