import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad';
  hint?: string;
}

function Field({ label, value, onChangeText, error, placeholder, multiline, keyboardType = 'default', hint }: FieldProps) {
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
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          Typography.bodyMd,
          styles.input,
          multiline && styles.multiline,
          {
            color: C.onSurface,
            borderColor: error ? C.error : C.outlineVariant,
            backgroundColor: C.surfaceContainerLow,
          },
        ]}
      />
      {hint && !error && (
        <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 4 }]}>{hint}</Text>
      )}
      {error && (
        <Text style={[Typography.caption, { color: C.error, marginTop: 4 }]}>{error}</Text>
      )}
    </View>
  );
}

export function AnnouncerForm({ defaultValues, onSubmit, loading }: AnnouncerFormProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const { control, handleSubmit, formState: { errors } } = useForm<AnnouncerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: defaultValues?.company_name ?? '',
      bio: defaultValues?.bio ?? '',
      professional_phone: defaultValues?.professional_phone ?? '',
    },
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="company_name"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Nom de la structure / agence"
            value={value ?? ''}
            onChangeText={onChange}
            error={errors.company_name?.message}
            placeholder="Ex. Domilix Immobilier"
          />
        )}
      />
      <Controller
        control={control}
        name="bio"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Présentation"
            value={value ?? ''}
            onChangeText={onChange}
            error={errors.bio?.message}
            placeholder="Décrivez votre activité en quelques phrases…"
            multiline
            hint="300 caractères max"
          />
        )}
      />
      <Controller
        control={control}
        name="professional_phone"
        render={({ field: { value, onChange } }) => (
          <Field
            label="Téléphone professionnel"
            value={value ?? ''}
            onChangeText={onChange}
            error={errors.professional_phone?.message}
            placeholder="+237 6XX XXX XXX"
            keyboardType="phone-pad"
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
            Mettre à jour le profil annonceur
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
  multiline: {
    height: 100,
    paddingTop: Spacing.md,
  },
  submitBtn: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
});
