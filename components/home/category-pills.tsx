import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Category } from '@/types/announce';

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  Appartement: 'apartment',
  Villa: 'villa',
  Studio: 'single-bed',
  Duplex: 'domain',
  Bureau: 'business',
  Terrain: 'landscape',
  Immeuble: 'location-city',
  'Salon & Canapés': 'chair',
  Chambre: 'bedroom-parent',
  'Cuisine & Équipement': 'kitchen',
  Décoration: 'palette',
};

const ALL_PILL = { id: 'all', name: 'Tous', type: 'house' as const };

interface CategoryPillsProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryPills({ categories, selected, onSelect }: CategoryPillsProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const pills = [ALL_PILL, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {pills.map((cat) => {
        const active = selected === null ? cat.id === 'all' : cat.id === selected;
        const icon = CATEGORY_ICONS[cat.name] ?? 'category';

        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id === 'all' ? null : cat.id)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? C.primary : C.surfaceContainer,
                borderColor: active ? C.primary : C.outlineVariant,
              },
            ]}
          >
            <MaterialIcons
              name={icon}
              size={16}
              color={active ? C.onPrimary : C.onSurface}
            />
            <Text
              style={[
                Typography.labelSm,
                {
                  color: active ? C.onPrimary : C.onSurface,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                },
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.marginMobile,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    shadowColor: 'rgb(82,69,52)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});
