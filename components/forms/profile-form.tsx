import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, type TextInput } from 'react-native';
import { z } from 'zod';

import { Button, Field, KeyboardTarget } from '@/components/ui';
import { Spacing } from '@/constants/theme';

const schema = z.object({
  name: z.string().min(2, 'Nom requis (2 caractères min)'),
  email: z.string().email('Email invalide').or(z.literal('')).optional(),
  phone_number: z
    .string()
    .regex(/^\+?[0-9\s]{9,15}$/, 'Numéro invalide')
    .or(z.literal(''))
    .optional(),
});

export type ProfileFormValues = z.infer<typeof schema>;

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
  loading?: boolean;
}

/**
 * Name, email and phone of the account. Errors are the kit Field messages
 * (read by TalkBack); the keyboard's "Suivant" moves down the fields and the
 * last one submits. Use inside `<Screen keyboard>`.
 */
export function ProfileForm({ defaultValues, onSubmit, loading }: ProfileFormProps) {
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone_number: defaultValues?.phone_number ?? '',
    },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <View style={{ gap: Spacing.md }}>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field
            label="Nom complet"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Jean Dupont"
            autoCapitalize="words"
            autoComplete="name"
            error={errors.name?.message}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field
            ref={emailRef}
            label="Email"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="phone_number"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field
            ref={phoneRef}
            label="Téléphone"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="+237 6XX XXX XXX"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoComplete="tel"
            error={errors.phone_number?.message}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        )}
      />

      <KeyboardTarget>
        <Button
          label="Enregistrer les modifications"
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
