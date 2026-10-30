import { useRouter } from 'expo-router';

import { AmenityPicker, StandingPicker } from '@/components/forms/listing-features';
import { MAX_BEDROOMS } from '@/components/forms/listing-options';
import { CREATE_TITLE, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { Screen, StepHeader, Stepper } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useCreateListingStore } from '@/stores/create-listing.store';

export default function CreateStep4Screen() {
  const router = useRouter();
  const { draft, setDraft } = useCreateListingStore();

  return (
    <Screen
      header={<StepHeader title={CREATE_TITLE} step={4} total={5} onBack={() => router.back()} />}
      footer={<StepFooter onPrevious={() => router.back()} onNext={() => router.push('/announces/create/step-5')} />}
      contentStyle={{ gap: Spacing.lg }}
    >
      <StepIntro title="Équipements" description="Sélectionnez les équipements disponibles dans votre bien." />

      <Stepper
        label="Chambres"
        helper="0 pour un studio"
        value={draft.bedrooms}
        onChange={(n) => setDraft({ bedrooms: n })}
        min={0}
        max={MAX_BEDROOMS}
      />

      <StandingPicker value={draft.standing} onChange={(standing) => setDraft({ standing })} />

      <AmenityPicker value={draft} onToggle={(key) => setDraft({ [key]: !draft[key] })} />
    </Screen>
  );
}
