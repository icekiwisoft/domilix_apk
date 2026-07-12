import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CreateStepHeaderProps {
  step: number;
  total: number;
  onBack: () => void;
  /** Step 1 shows a "close" icon (exits the flow); later steps show "back". */
  closeMode?: boolean;
}

export function CreateStepHeader({ step, total, onBack, closeMode }: CreateStepHeaderProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <>
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <IconButton
          icon={closeMode ? 'close' : 'arrow-left'}
          size={22}
          onPress={onBack}
          accessibilityLabel={closeMode ? 'Fermer' : 'Retour'}
        />
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 18 }]}>
          Nouvelle annonce
        </Text>
        <Text style={[Typography.caption, { color: C.onSurfaceVariant, width: 40, textAlign: 'right' }]}>
          {step}/{total}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: C.surfaceVariant }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: C.primary, width: `${(step / total) * 100}%` },
          ]}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  progressTrack: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
