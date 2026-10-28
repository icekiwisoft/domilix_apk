import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, TextInput } from 'react-native-paper';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

// Building blocks shared by the four steps of the publish wizard.

export function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={styles.titleBlock}>
      <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
        {title}
      </Text>
      <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs }]}>{subtitle}</Text>
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <Text
      style={[
        Typography.labelSm,
        { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: Spacing.sm },
      ]}
    >
      {children}
    </Text>
  );
}

interface ChoiceChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: IconName;
}

// Pill used for categories, standing, land use, amenities, periods…
export function ChoiceChip({ label, active, onPress, icon }: ChoiceChipProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? C.primary : C.surfaceContainer, borderColor: active ? C.primary : C.outlineVariant },
      ]}
    >
      {icon && <MaterialIcons name={icon} size={18} color={active ? C.onPrimary : C.onSurfaceVariant} />}
      <Text
        style={[
          Typography.bodyMd,
          { color: active ? C.onPrimary : C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

// Integer counter field (rooms…), stored as a number in the draft.
export function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <TextInput
      mode="outlined"
      label={label}
      value={value ? String(value) : ''}
      placeholder="0"
      keyboardType="number-pad"
      onChangeText={(text) => onChange(Number.parseInt(text.replace(/\D/g, ''), 10) || 0)}
      style={styles.flex}
    />
  );
}

interface WizardFooterProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  error?: string;
}

export function WizardFooter({ label, onPress, disabled, loading, icon = 'arrow-right', error }: WizardFooterProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={[styles.footer, { borderTopColor: C.outlineVariant, backgroundColor: C.surface }]}>
      {error ? <Text style={[Typography.caption, styles.footerError, { color: C.error }]}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={onPress}
        disabled={disabled || loading}
        loading={loading}
        icon={loading ? undefined : icon}
        contentStyle={styles.footerBtnContent}
        style={styles.footerBtn}
      >
        {label}
      </Button>
    </View>
  );
}

export const wizardStyles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
});

const styles = StyleSheet.create({
  titleBlock: { marginBottom: Spacing.xs },
  flex: { flex: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.xs,
  },
  footerError: { textAlign: 'center' },
  footerBtn: { borderRadius: Radius.md },
  footerBtnContent: { height: 52, flexDirection: 'row-reverse' },
});
