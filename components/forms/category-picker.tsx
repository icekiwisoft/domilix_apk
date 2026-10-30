import { View } from 'react-native';

import { AppText, ChipGroup, ErrorState, OfflineState, Skeleton } from '@/components/ui';
import { Radii, Sizes, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/queries/use-categories';
import { categoryLabel } from '@/lib/category-label';
import { isNetworkError } from '@/lib/network-error';
import type { AnnounceType } from '@/types/announce';

export interface CategoryPickerProps {
  type: AnnounceType;
  value: string;
  onChange: (id: string) => void;
}

/**
 * "Catégorie" of a listing: one chip per category of the property type
 * (GET /categories, cached 10 min), a skeleton while it loads and an error or
 * offline state with Réessayer when it fails.
 */
export function CategoryPicker({ type, value, onChange }: CategoryPickerProps) {
  const categoryType = type === 'realestate' ? 'house' : 'furniture';
  const { data, isLoading, isError, error, refetch } = useCategories({ type: categoryType });
  const categories = data?.data ?? [];

  let body;
  if (isLoading) {
    body = (
      <View
        accessible
        accessibilityLabel="Chargement des catégories…"
        accessibilityState={{ busy: true }}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width={Sizes.chipSkeletonWidth} height={Sizes.touchTarget} radius={Radii.full} />
        ))}
      </View>
    );
  } else if (isError && isNetworkError(error)) {
    body = <OfflineState onRetry={() => refetch()} style={{ padding: Spacing.md }} />;
  } else if (isError) {
    body = (
      <ErrorState
        title="Impossible de charger les catégories"
        onRetry={() => refetch()}
        style={{ padding: Spacing.md }}
      />
    );
  } else if (categories.length === 0) {
    body = <AppText color="onSurfaceVariant">Aucune catégorie disponible pour ce type de bien.</AppText>;
  } else {
    body = (
      <ChipGroup
        label="Catégorie"
        options={categories.map((c) => ({ value: c.id, label: categoryLabel(c.name) }))}
        value={value || null}
        onChange={onChange}
      />
    );
  }

  return (
    <View style={{ gap: Spacing.sm }}>
      <AppText variant="bodyStrong" accessibilityRole="header">
        Catégorie
      </AppText>
      {body}
    </View>
  );
}
