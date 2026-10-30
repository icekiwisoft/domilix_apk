import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { View, type TextInput } from 'react-native';

import { CategoryPicker } from '@/components/forms/category-picker';
import { DEVISE_OPTIONS, deviseLabel } from '@/components/forms/listing-options';
import { CREATE_TITLE, createStepTotal, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { Field, Screen, SegmentedControl, StepHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { digitsOnly } from '@/lib/digits';
import { useCreateListingStore } from '@/stores/create-listing.store';

export default function CreateStep2Screen() {
  const router = useRouter();
  const { draft, setDraft } = useCreateListingStore();
  const total = createStepTotal(draft.type);
  const sizeRef = useRef<TextInput>(null);
  const isRealestate = draft.type === 'realestate';

  const canContinue = !!draft.category_id && !!draft.price;

  return (
    <Screen
      keyboard
      header={<StepHeader title={CREATE_TITLE} step={2} total={total} onBack={() => router.back()} />}
      footer={
        <StepFooter
          onPrevious={() => router.back()}
          onNext={() => router.push('/announces/create/step-3')}
          disabled={!canContinue}
          hint="Choisissez une catégorie et indiquez un prix pour continuer."
        />
      }
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro title="Catégorie et prix" description="Précisez la catégorie et le prix de votre bien." />

      <CategoryPicker
        type={draft.type}
        value={draft.category_id}
        onChange={(id) => setDraft({ category_id: id })}
      />

      <View style={{ gap: Spacing.sm }}>
        <Field
          label="Prix"
          labelHint={draft.ad_type === 'location' ? '(par mois)' : undefined}
          value={draft.price}
          onChangeText={(t) => setDraft({ price: digitsOnly(t) })}
          keyboardType="number-pad"
          suffix={deviseLabel(draft.devise)}
          returnKeyType={isRealestate ? 'next' : 'done'}
          submitBehavior={isRealestate ? 'submit' : 'blurAndSubmit'}
          onSubmitEditing={() => sizeRef.current?.focus()}
        />
        <SegmentedControl
          label="Devise"
          options={DEVISE_OPTIONS}
          value={draft.devise}
          onChange={(v) => setDraft({ devise: v })}
        />
      </View>

      {isRealestate ? (
        <Field
          ref={sizeRef}
          label="Surface"
          labelHint="(facultatif)"
          placeholder="Ex. 120"
          value={draft.size}
          onChangeText={(t) => setDraft({ size: digitsOnly(t) })}
          keyboardType="number-pad"
          suffix="m²"
          returnKeyType="done"
        />
      ) : null}
    </Screen>
  );
}
