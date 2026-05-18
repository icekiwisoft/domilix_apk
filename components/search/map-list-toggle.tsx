import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MapListToggleProps {
  mode: 'list' | 'map';
  onToggle: () => void;
}

export function MapListToggle({ mode, onToggle }: MapListToggleProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const isMap = mode === 'map';

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: C.primary, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <MaterialIcons
        name={isMap ? 'list' : 'map'}
        size={18}
        color={C.onPrimary}
      />
      <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
        {isMap ? 'Liste' : 'Carte'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    shadowColor: '#633f00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});
