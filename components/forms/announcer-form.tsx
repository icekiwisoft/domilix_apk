import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, type TextInput } from 'react-native';
import { z } from 'zod';

import { Button, Field, KeyboardTarget } from '@/components/ui';
import { Spacing } from '@/constants/theme';

const schema = z.object({
  company_name: z.string().min(2, 'Nom de structure requis').optional().or(z.literal('')),
  bio: z.string().max(300, '300 caractères max').optional().or(z.literal('')),
  professional_phone: z
    .string()
    .regex(/^\+?[0-9\s]{9,15}$/, 'Numéro invalide')
    .or(z.literal(''))
    .optional(),
});

export type AnnouncerFormValues = z.infer<typeof schema>;

interface AnnouncerFormProps {
  defaultValues?: Partial<AnnouncerFormValues>;
  onSubmit: (values: AnnouncerFormValues) => void | Promise<void>;
  loading?: boolean;
}

/**
 * Public announcer details (structure name, presentation, professional
 * phone) on kit Fields: errors read by TalkBack, keyboard "Suivant" from the
 * name to the multi-line presentation, the phone submits. Use inside `<Screen keyboard>`.
 */
export function AnnouncerForm({ defaultValues, onSubmit, loading }: AnnouncerFormProps) {
  const bioRef = useRef<TextInput>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: defaultValues?.company_name ?? '',
      bio: defaultValues?.bio ?? '',
      professional_phone: defaultValues?.professional_phone ?? '',
    },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <View style={{ gap: Spacing.md }}>
      <Controller
        control={control}
        name="company_name"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field
            label="Nom de la structure / agence"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.company_name?.message}
            placeholder="Ex. Domilix Immobilier"
            autoCapitalize="words"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => bioRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="bio"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field
            ref={bioRef}
            label="Présentation"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.bio?.message}
            placeholder="Décrivez votre activité en quelques phrases…"
            multiline
            numberOfLines={4}
            helper="300 caractères max"
          />
        )}
      />
      <Controller
        control={control}
        name="professional_phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field
            label="Téléphone professionnel"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.professional_phone?.message}
            placeholder="+237 6XX XXX XXX"
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        )}
      />

      <KeyboardTarget>
        <Button
          label="Mettre à jour le profil annonceur"
          size="lg"
          fullWidth
          loading={loading}
          onPress={submit}
          style={{ marginTop: Spacing.sm }}
        />
      </KeyboardTarget>
    </View>
  );
}
