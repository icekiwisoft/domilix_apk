import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  EmptyState,
  Field,
  KeyboardTarget,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSendResetEmail } from '@/hooks/queries/use-auth-queries';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators/auth.schema';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [sentEmail, setSentEmail] = useState('');
  const sendReset = useSendResetEmail();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    sendReset.mutate(data.email, { onSuccess: () => setSentEmail(data.email) });
  }

  if (sendReset.isSuccess) {
    return (
      <Screen background="surface">
        <View style={{ flexGrow: 1, justifyContent: 'center', gap: Spacing.sm }}>
          <EmptyState
            icon="mark-email-read"
            title="Email envoyé !"
            description="Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe."
            actionLabel="Saisir le code"
            onAction={() => router.push({ pathname: '/(auth)/reset-password', params: { email: sentEmail } })}
            style={{ flexGrow: 0 }}
          />
          <Button
            variant="text"
            label="Retour à la connexion"
            onPress={() => router.replace('/(auth)/login')}
            style={{ alignSelf: 'center' }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen keyboard background="surface" header={<ScreenHeader title="Mot de passe oublié" />}>
      <AppText color="onSurfaceVariant">
        Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
      </AppText>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label="Adresse e-mail"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={handleSubmit(onSubmit)}
            error={errors.email?.message}
          />
        )}
      />

      {sendReset.error ? (
        <Banner tone="error">{"Impossible d'envoyer l'email. Vérifiez l'adresse et réessayez."}</Banner>
      ) : null}

      <KeyboardTarget>
        <Button
          label="Envoyer le code"
          size="lg"
          fullWidth
          onPress={handleSubmit(onSubmit)}
          loading={sendReset.isPending}
          style={{ marginTop: Spacing.xs }}
        />
      </KeyboardTarget>
    </Screen>
  );
}
