import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Field,
  KeyboardTarget,
  ListRow,
  Screen,
  ScreenHeader,
  Section,
  SegmentedControl,
  useToast,
  type SegmentOption,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useChangePassword } from '@/hooks/queries/use-auth-queries';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/auth.schema';
import { useThemeStore, type ThemePreference } from '@/stores/theme.store';

const THEME_OPTIONS: readonly SegmentOption<ThemePreference>[] = [
  { value: 'light', label: 'Clair', icon: 'light-mode' },
  { value: 'dark', label: 'Sombre', icon: 'dark-mode' },
  { value: 'system', label: 'Système', icon: 'brightness-auto' },
];

type PasswordField = keyof ChangePasswordFormValues;

const PASSWORD_FIELDS: { name: PasswordField; label: string; autoComplete: 'current-password' | 'new-password' }[] = [
  { name: 'oldPassword', label: 'Mot de passe actuel', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'Nouveau mot de passe', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirmer le nouveau mot de passe', autoComplete: 'new-password' },
];

/** Heading of a block that is not a list of rows (Section draws rows in a card). */
function BlockTitle({ children }: { children: string }) {
  return (
    <AppText variant="label" color="onSurfaceVariant" accessibilityRole="header" style={{ paddingHorizontal: Spacing.xs }}>
      {children}
    </AppText>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { preference, setPreference } = useThemeStore();
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  function onSubmit(data: ChangePasswordFormValues) {
    changePassword.mutate(
      {
        old_password: data.oldPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.show('Mot de passe mis à jour.', 'success');
          reset();
        },
        onError: () => {
          toast.show('Mot de passe actuel incorrect ou erreur serveur.', 'error');
        },
      }
    );
  }

  return (
    <Screen keyboard header={<ScreenHeader title="Paramètres" />} contentStyle={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.sm }}>
        <BlockTitle>Apparence</BlockTitle>
        <SegmentedControl
          label="Thème de l'application"
          options={THEME_OPTIONS}
          value={preference}
          onChange={setPreference}
        />
      </View>

      <View style={{ gap: Spacing.md }}>
        <BlockTitle>Changer le mot de passe</BlockTitle>
        {PASSWORD_FIELDS.map(({ name, label, autoComplete }) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={label}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secure
                autoComplete={autoComplete}
                error={errors[name]?.message}
              />
            )}
          />
        ))}
        <KeyboardTarget>
          <Button
            label="Mettre à jour le mot de passe"
            size="lg"
            fullWidth
            loading={changePassword.isPending}
            onPress={handleSubmit(onSubmit)}
          />
        </KeyboardTarget>
      </View>

      {/* Developer entry, only in builds with EXPO_PUBLIC_SHOW_CATALOGUE=1 */}
      {process.env.EXPO_PUBLIC_SHOW_CATALOGUE === '1' ? (
        <Section title="Développement">
          <ListRow
            title="Catalogue des composants"
            icon="widgets"
            chevron
            onPress={() => router.push('/dev/catalogue' as Href)}
          />
        </Section>
      ) : null}
    </Screen>
  );
}
