import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={styles.row}>
      <Text style={[Typography.headlineMd, styles.title, { color: C.onSurface }]}>
        {title}
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAll} hitSlop={8}>
          <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Voir tout
          </Text>
          <MaterialIcons name="chevron-right" size={16} color={C.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
