import { View } from 'react-native';

import { RadioRow, Sheet } from '@/components/ui';
import { Spacing } from '@/constants/theme';

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

// Scrollable single-choice list in a bottom sheet (used for the 23 currencies).
export function OptionPickerDialog({ visible, title, options, selected, onSelect, onDismiss }: OptionPickerDialogProps) {
  return (
    <Sheet visible={visible} onClose={onDismiss} title={title}>
      <View accessibilityRole="radiogroup" accessibilityLabel={title} style={{ gap: Spacing.xs }}>
        {options.map((option) => (
          <RadioRow
            key={option.value}
            title={option.label}
            selected={option.value === selected}
            onPress={() => {
              onSelect(option.value);
              onDismiss();
            }}
          />
        ))}
      </View>
    </Sheet>
  );
}
