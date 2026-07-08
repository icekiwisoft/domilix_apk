import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
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

export function ProfileForm({ defaultValues, onSubmit, loading }: ProfileFormProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone_number: defaultValues?.phone_number ?? '',
    },
  });

  return (
    <View style={styles.form}>
      <View>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Nom complet"
              value={value ?? ''}
              onChangeText={onChange}
              placeholder="Jean Dupont"
              autoCapitalize="words"
              error={!!errors.name}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name?.message}
        </HelperText>
      </View>

      <View>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Email"
              value={value ?? ''}
              onChangeText={onChange}
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email?.message}
        </HelperText>
      </View>

      <View>
        <Controller
          control={control}
          name="phone_number"
          render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Téléphone"
              value={value ?? ''}
              onChangeText={onChange}
              placeholder="+237 6XX XXX XXX"
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={!!errors.phone_number}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.phone_number}>
          {errors.phone_number?.message}
        </HelperText>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        disabled={loading}
        style={styles.submitBtn}
        contentStyle={styles.submitContent}
      >
        Enregistrer les modifications
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.xs },
  submitBtn: { marginTop: Spacing.sm },
  submitContent: { height: 48 },
});
