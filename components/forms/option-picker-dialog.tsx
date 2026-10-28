import { Pressable, StyleSheet, Text } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Option {
  value: string;
  label: string;
}

interface OptionPickerDialogProps {
  visible: boolean;
  title: string;
  options: readonly Option[];
  selected: string;
  onSelect: (value: string) => void;
  onDismiss: () => void;
}

// Scrollable single-choice list in a dialog (used for the 23 currencies).
export function OptionPickerDialog({ visible, title, options, selected, onSelect, onDismiss }: OptionPickerDialogProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ maxHeight: '80%' }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <Dialog.Content style={styles.content}>
            {options.map((option) => {
              const active = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    onSelect(option.value);
                    onDismiss();
                  }}
                  style={[styles.row, active && { backgroundColor: C.primaryFixed + '55' }]}
                >
                  <MaterialIcons
                    name={active ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={active ? C.primary : C.onSurfaceVariant}
                  />
                  <Text style={[Typography.bodyMd, { color: C.onSurface }]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </Dialog.Content>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button mode="text" onPress={onDismiss}>Fermer</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollArea: { paddingHorizontal: 0 },
  content: { paddingHorizontal: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
});
