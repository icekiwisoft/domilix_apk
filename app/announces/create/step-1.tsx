import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { CategoryPicker } from '@/components/forms/category-picker';
import { AD_TYPE_OPTIONS } from '@/components/forms/listing-options';
import { CREATE_STEPS, CREATE_TITLE, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { AppText, Dialog, RadioRow, Screen, SegmentedControl, StepHeader, type IconName } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/queries/use-categories';
import { isDraftEmpty, useCreateListingStore, type CreatableType } from '@/stores/create-listing.store';

const TYPE_CARDS: readonly { value: CreatableType; label: string; hint: string; icon: IconName }[] = [
  {
    value: 'realestate',
    label: 'Immobilier',
    hint: 'Appartement, studio, chambre, maison, bureau',
    icon: 'home-work',
  },
  { value: 'land', label: 'Terrain', hint: 'Terrain à bâtir, agricole, commercial', icon: 'square-foot' },
  { value: 'furniture', label: 'Mobilier', hint: 'Meubles, électroménager, décoration', icon: 'chair' },
];

export default function CreateStep1Screen() {
  const router = useRouter();
  const { draft, setDraft, resetDraft } = useCreateListingStore();
  // Opening the flow with a draft left from an earlier visit: offer to go on
  // with it or start over (read once, when the flow opens).
  const [askResume, setAskResume] = useState(() => !isDraftEmpty(useCreateListingStore.getState().draft));
  const isLand = draft.type === 'land';

  // Land listings have no category (usage and surface describe them).
  const { data: categoriesData } = useCategories(
    { type: draft.type === 'realestate' ? 'house' : 'furniture' },
    { enabled: !isLand }
  );
  const loadedCategories = categoriesData?.data;

  // Like the website, a category is always selected once they are loaded.
  // The API sends numeric ids: compare them as strings, as CategoryPicker does.
  useEffect(() => {
    if (isLand || !loadedCategories || loadedCategories.length === 0) return;
    if (!loadedCategories.some((c) => String(c.id) === String(draft.category_id))) {
      setDraft({ category_id: String(loadedCategories[0].id) });
    }
  }, [isLand, loadedCategories, draft.category_id, setDraft]);

  const canContinue = !!draft.ad_type && (isLand || !!draft.category_id);

  function selectType(type: CreatableType) {
    if (type !== draft.type) setDraft({ type, category_id: '' });
  }

  return (
    <Screen
      header={
        <StepHeader title={CREATE_TITLE} step={1} total={CREATE_STEPS} onBack={() => router.back()} closeMode />
      }
      footer={
        <StepFooter
          onNext={() => router.push('/announces/create/step-2')}
          disabled={!canContinue}
          hint="Choisissez une catégorie pour continuer."
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro title="Que publiez-vous ?" description="Vous pourrez modifier ces choix avant la publication." />

      <View accessibilityRole="radiogroup" accessibilityLabel="Type de bien" style={{ gap: Spacing.ms }}>
        {TYPE_CARDS.map((opt) => (
          <RadioRow
            key={opt.value}
            variant="card"
            icon={opt.icon}
            title={opt.label}
            subtitle={opt.hint}
            selected={draft.type === opt.value}
            onPress={() => selectType(opt.value)}
          />
        ))}
      </View>

      {!isLand ? (
        <CategoryPicker
          type={draft.type}
          value={draft.category_id}
          onChange={(id) => setDraft({ category_id: id })}
        />
      ) : null}

      <View style={{ gap: Spacing.sm }}>
        <AppText variant="bodyStrong" accessibilityRole="header">
          {"Type d'annonce"}
        </AppText>
        <SegmentedControl
          label="Type d'annonce"
          options={AD_TYPE_OPTIONS}
          value={draft.ad_type}
          onChange={(v) => setDraft({ ad_type: v })}
        />
      </View>
      <Dialog
        visible={askResume}
        title="Reprendre votre annonce ?"
        message="Une annonce commencée n'a pas été publiée. Vous pouvez la reprendre ou en créer une nouvelle."
        // Dismissing the dialog (back, tap outside) keeps the draft: only the
        // explicit "Nouvelle annonce" clears it.
        confirmLabel="Nouvelle annonce"
        cancelLabel="Reprendre"
        onConfirm={() => {
          resetDraft();
          setAskResume(false);
        }}
        onCancel={() => setAskResume(false)}
      />
    </Screen>
  );
}
