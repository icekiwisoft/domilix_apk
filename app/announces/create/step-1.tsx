import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AD_TYPE_OPTIONS } from '@/components/forms/listing-options';
import { CREATE_TITLE, createStepTotal, StepFooter, StepIntro } from '@/components/forms/step-layout';
import { AppText, RadioRow, Screen, SegmentedControl, StepHeader, type IconName } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useCreateListingStore } from '@/stores/create-listing.store';
import type { AnnounceType } from '@/types/announce';

const TYPE_CARDS: readonly { value: AnnounceType; label: string; hint: string; icon: IconName }[] = [
  {
    value: 'realestate',
    label: 'Immobilier',
    hint: 'Appartement, studio, chambre, maison, bureau, terrain',
    icon: 'home-work',
  },
  { value: 'furniture', label: 'Mobilier', hint: 'Meubles, électroménager, décoration', icon: 'chair' },
];

export default function CreateStep1Screen() {
  const router = useRouter();
  const { draft, setDraft } = useCreateListingStore();

  return (
    <Screen
      header={
        <StepHeader
          title={CREATE_TITLE}
          step={1}
          total={createStepTotal(draft.type)}
          onBack={() => router.back()}
          closeMode
        />
      }
      footer={
        <StepFooter onNext={() => router.push('/announces/create/step-2')} disabled={!draft.type || !draft.ad_type} />
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
            onPress={() => setDraft({ type: opt.value, category_id: '' })}
          />
        ))}
      </View>

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
    </Screen>
  );
}
