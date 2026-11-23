import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Linking, View } from 'react-native';

import {
  AppText,
  Button,
  Dialog,
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
import { OtpInput } from '@/components/ui/otp-input';
import { Spacing } from '@/constants/theme';
import {
  useChangePassword,
  useDeleteAccount,
  useMe,
  useSendEmailVerification,
  useVerifyEmail,
} from '@/hooks/queries/use-auth-queries';
import { getApiErrorMessage } from '@/lib/api-error';
import { getPushPermission, registerForPushNotifications } from '@/lib/push-notifications';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/auth.schema';
import { useThemeStore, type ThemePreference } from '@/stores/theme.store';
import { useTourStore } from '@/stores/tour.store';

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
  const resetTours = useTourStore((s) => s.reset);
  const [pushGranted, setPushGranted] = useState(false);

  useEffect(() => {
    getPushPermission()
      .then((p) => setPushGranted(p.granted))
      .catch(() => setPushGranted(false));
  }, []);

  // Asks the system dialog while Android still allows it, otherwise opens the
  // app's system settings where the user can turn notifications on.
  async function enablePush() {
    const { canAskAgain } = await getPushPermission();
    if (!canAskAgain) {
      void Linking.openSettings();
      return;
    }
    const granted = await registerForPushNotifications(true).catch(() => false);
    setPushGranted(granted);
    if (!granted) toast.show('Notifications refusées. Vous pouvez les activer dans les réglages du téléphone.', 'info');
  }
  const changePassword = useChangePassword();
  const { data: me } = useMe();
  const sendEmailVerification = useSendEmailVerification();
  const verifyEmail = useVerifyEmail();
  const deleteAccount = useDeleteAccount();
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const needsEmailVerification = !!me?.email && me.email_verified === false;

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

  function handleSendEmailCode() {
    sendEmailVerification.mutate(undefined, {
      onSuccess: () => {
        setEmailCodeSent(true);
        toast.show('Code envoyé. Consultez votre boîte email.', 'success');
      },
      onError: (err) => toast.show(getApiErrorMessage(err, "Impossible d'envoyer le code."), 'error'),
    });
  }

  function handleVerifyEmail() {
    verifyEmail.mutate(emailCode, {
      onSuccess: () => {
        setEmailCode('');
        setEmailCodeSent(false);
        toast.show('Email vérifié avec succès.', 'success');
      },
      onError: (err) => toast.show(getApiErrorMessage(err, 'Code de vérification incorrect.'), 'error'),
    });
  }

  function handleDeleteAccount() {
    if (!deletePassword) return;
    deleteAccount.mutate(deletePassword, {
      onSuccess: () => {
        setDeleteVisible(false);
        router.replace('/(auth)');
      },
      onError: (err) => toast.show(getApiErrorMessage(err, 'Mot de passe incorrect ou erreur serveur.'), 'error'),
    });
  }

  return (
    <Screen keyboard header={<ScreenHeader title="Paramètres" />} contentStyle={{ gap: Spacing.lg }}>
      {/* Every account field the API lets the user change (PUT /auth/me, PUT /auth/announcer-profile). */}
      {me ? (
        <Section title="Mon compte">
          <ListRow
            title="Informations personnelles"
            subtitle={[me.name, me.email, me.phone_number].filter(Boolean).join(' · ') || 'Nom, email, téléphone'}
            icon="person-outline"
            onPress={() => router.push('/profile/edit')}
          />
          <ListRow
            title="Photo de profil et image de présentation"
            subtitle="Affichées sur votre profil et votre page annonceur"
            icon="photo-camera"
            onPress={() => router.push('/profile/edit')}
          />
          {me.phone_number && !me.phone_verified ? (
            <ListRow
              title="Vérifier mon numéro"
              subtitle={`${me.phone_number} n'est pas encore vérifié`}
              icon="sms"
              onPress={() =>
                router.push({ pathname: '/(auth)/verify-phone/[user_id]', params: { user_id: me.id, phone: me.phone_number } })
              }
            />
          ) : null}
          {me.announcer ? (
            <ListRow
              title="Profil annonceur"
              subtitle="Entreprise, bio, téléphone professionnel"
              icon="storefront"
              onPress={() => router.push('/profile/announcer-profile')}
            />
          ) : (
            <ListRow
              title="Devenir annonceur"
              subtitle="Publiez vos biens sur Domilix"
              icon="campaign"
              onPress={() => router.push('/profile/become-announcer')}
            />
          )}
          <ListRow
            title="Alertes de recherche"
            subtitle="Être averti des nouvelles annonces"
            icon="notifications-none"
            onPress={() => router.push('/profile/alerts')}
          />
        </Section>
      ) : null}

      <Section title="Notifications">
        <ListRow
          title="Notifications push"
          subtitle={
            pushGranted
              ? 'Activées sur ce téléphone'
              : 'Paiements, déblocages et nouvelles annonces de vos alertes'
          }
          icon={pushGranted ? 'notifications-active' : 'notifications-off'}
          chevron={!pushGranted}
          onPress={pushGranted ? undefined : enablePush}
        />
      </Section>

      <Section title="Aide">
        <ListRow
          title="Revoir le guide de l'application"
          subtitle="Le doigt vous montre à nouveau chaque étape"
          icon="touch-app"
          onPress={() => {
            resetTours();
            router.replace('/(tabs)');
          }}
        />
      </Section>

      <View style={{ gap: Spacing.sm }}>
        <BlockTitle>Apparence</BlockTitle>
        <SegmentedControl
          label="Thème de l'application"
          options={THEME_OPTIONS}
          value={preference}
          onChange={setPreference}
        />
      </View>

      {needsEmailVerification ? (
        <View style={{ gap: Spacing.md }}>
          <BlockTitle>{"Vérification de l'email"}</BlockTitle>
          <AppText color="onSurfaceVariant">
            {`Votre adresse ${me?.email} n'est pas encore vérifiée. Un code à 6 chiffres vous sera envoyé.`}
          </AppText>
          {emailCodeSent ? (
            <>
              <OtpInput value={emailCode} onChange={setEmailCode} />
              <Button
                label="Vérifier"
                size="lg"
                fullWidth
                loading={verifyEmail.isPending}
                disabled={emailCode.length < 6}
                onPress={handleVerifyEmail}
              />
            </>
          ) : null}
          <Button
            label={emailCodeSent ? 'Renvoyer le code' : 'Envoyer le code'}
            variant={emailCodeSent ? 'text' : 'primary'}
            size="lg"
            fullWidth
            loading={sendEmailVerification.isPending}
            onPress={handleSendEmailCode}
          />
        </View>
      ) : null}

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
            onPress={() => void handleSubmit(onSubmit)()}
          />
        </KeyboardTarget>
      </View>

      <View style={{ gap: Spacing.md }}>
        <BlockTitle>Supprimer mon compte</BlockTitle>
        <AppText color="onSurfaceVariant">
          Cette action désactive votre compte Domilix. Vous serez déconnecté immédiatement et ne pourrez plus accéder à
          votre espace.
        </AppText>
        <Button
          label="Supprimer mon compte"
          variant="danger"
          size="lg"
          fullWidth
          onPress={() => {
            setDeletePassword('');
            setDeleteVisible(true);
          }}
        />
      </View>

      <Dialog
        visible={deleteVisible}
        title="Confirmer la suppression"
        message="Saisissez votre mot de passe pour supprimer votre compte Domilix. Cette action est irréversible."
        confirmLabel="Supprimer définitivement"
        danger
        loading={deleteAccount.isPending}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteVisible(false)}
      >
        <Field
          label="Votre mot de passe"
          value={deletePassword}
          onChangeText={setDeletePassword}
          secure
          autoComplete="current-password"
        />
      </Dialog>

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
