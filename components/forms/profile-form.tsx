import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

function Field({ label, value, onChangeText, error, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }: FieldProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={styles.field}>
      <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.xs }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.onSurfaceVariant}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          Typography.bodyMd,
          styles.input,
          {
            color: C.onSurface,
            borderColor: error ? C.error : C.outlineVariant,
            backgroundColor: C.surfaceContainerLow,
          },
        ]}
      />
      {error && (
        <Text style={[Typography.caption, { color: C.error, marginTop: 4 }]}>{error}</Text>
      )}
    </View>
  );
}

export function ProfileForm({ defaultValues, onSubmit, loading }: ProfileFormProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

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
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Nom complet"
            value={value ?? ''}
            onChangeText={onChange}
            error={errors.name?.message}
            placeholder="Jean Dupont"
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Email"
            value={value ?? ''}
            onChangeText={onChange}
            error={errors.email?.message}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      <Controller
        control={control}
        name="phone_number"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Téléphone"
            value={value ?? ''}
            onChangeText={onChange}
            error={errors.phone_number?.message}
            placeholder="+237 6XX XXX XXX"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        )}
      />

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        style={[styles.submitBtn, { backgroundColor: C.primary, opacity: loading ? 0.7 : 1 }]}
      >
        {loading ? (
          <ActivityIndicator color={C.onPrimary} size="small" />
        ) : (
          <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Enregistrer les modifications
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.md },
  field: { gap: 0 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  submitBtn: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
});
