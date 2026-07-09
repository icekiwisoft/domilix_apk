import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/input';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useRegister } from '@/hooks/queries/use-auth-queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth.schema';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const register = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', terms: undefined as any },
  });

  function onSubmit(data: RegisterFormValues) {
    const phoneNumber = `+237${data.phone}`;
    register.mutate(
      { name: data.name, email: data.email || undefined, phone_number: phoneNumber, password: data.password },
      {
        onSuccess: (res) =>
          router.push({
            pathname: '/(auth)/verify-phone/[user_id]',
            params: { user_id: res.user.id, phone: phoneNumber },
          }),
      }
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        {router.canGoBack() && (
          <IconButton
            icon="arrow-left"
            mode="outlined"
            size={22}
            onPress={() => router.back()}
            accessibilityLabel="Retour"
            style={styles.backBtn}
          />
        )}

        {/* Headline */}
        <View style={styles.header}>
          <Text style={[Typography.headlineLg, { color: C.primary }]}>Créer un compte</Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs }]}>
            {"Rejoignez une communauté d'excellence immobilière."}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nom complet"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                error={errors.name?.message}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Adresse e-mail (optionnel)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.phoneRow,
                    {
                      borderColor: errors.phone ? C.error : C.outlineVariant,
                      borderWidth: errors.phone ? 2 : 1,
                      backgroundColor: C.surface,
                    },
                  ]}
                >
                  <View style={[styles.prefix, { backgroundColor: C.surfaceContainer, borderRightColor: C.outlineVariant }]}>
                    <Text style={[Typography.labelSm, { color: C.onSurfaceVariant }]}>+237</Text>
                  </View>
                  <TextInput
                    style={[styles.phoneField, { color: C.onSurface }]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    placeholder="6 00 00 00 00"
                    placeholderTextColor={C.onSurfaceVariant + '66'}
                  />
                </View>
              )}
            />
            {errors.phone && (
              <Text style={[Typography.caption, { color: C.error, marginTop: Spacing.xs, marginLeft: Spacing.md }]}>
                {errors.phone.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPwd}
                error={errors.password?.message}
                rightElement={
                  <Pressable
                    onPress={() => setShowPwd((v) => !v)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <MaterialIcons
                      name={showPwd ? 'visibility' : 'visibility-off'}
                      size={22}
                      color={C.onSurfaceVariant}
                    />
                  </Pressable>
                }
              />
            )}
          />

          {/* Confirm password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmer le mot de passe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showConfirm}
                error={errors.confirmPassword?.message}
                rightElement={
                  <Pressable
                    onPress={() => setShowConfirm((v) => !v)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <MaterialIcons
                      name={showConfirm ? 'visibility' : 'visibility-off'}
                      size={22}
                      color={C.onSurfaceVariant}
                    />
                  </Pressable>
                }
              />
            )}
          />

          {/* Terms */}
          <Controller
            control={control}
            name="terms"
            render={({ field: { onChange, value } }) => (
              <View style={styles.termsRow}>
                <Pressable
                  onPress={() => onChange(value ? undefined : true)}
                  hitSlop={8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!value }}
                  accessibilityLabel="J'accepte les conditions d'utilisation et la politique de confidentialité"
                  style={[
                    styles.checkbox,
                    {
                      borderColor: errors.terms ? C.error : value ? C.primary : C.outlineVariant,
                      backgroundColor: value ? C.primary : C.surface,
                    },
                  ]}
                >
                  {value && <MaterialIcons name="check" size={14} color={C.onPrimary} />}
                </Pressable>
                <Text style={[Typography.bodyMd, styles.termsText, { color: C.onSurfaceVariant }]}>
                  {"J'accepte les "}
                  <Text style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>
                    {"conditions d'utilisation"}
                  </Text>
                  {' et la '}
                  <Text
                    style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}
                    onPress={() => Linking.openURL('https://www.privacypolicies.com/live/8afdd5ff-63d9-4381-9f5b-a8222d7bd121')}
                    accessibilityRole="link"
                  >
                    politique de confidentialité
                  </Text>
                  {'.'}
                </Text>
              </View>
            )}
          />
          {errors.terms && (
            <Text style={[Typography.caption, { color: C.error, marginLeft: Spacing.xs }]}>
              {errors.terms.message}
            </Text>
          )}

          {/* Erreur serveur */}
          {register.error && (
            <View style={[styles.errorBanner, { backgroundColor: C.errorContainer + '33', borderColor: C.error + '40' }]}>
              <MaterialIcons name="error-outline" size={16} color={C.error} />
              <Text style={[Typography.caption, { color: C.error, flex: 1 }]}>
                Impossible de créer le compte. Vérifiez vos informations et réessayez.
              </Text>
            </View>
          )}

          {/* Submit */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={register.isPending}
            disabled={register.isPending}
            contentStyle={styles.submitBtnContent}
            style={styles.submitBtn}
          >
            {"S'inscrire"}
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
            {'Déjà un compte ? '}
            <Text
              style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}
              onPress={() => router.push('/(auth)/login')}
              accessibilityRole="link"
            >
              Se connecter
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.marginMobile,
  },
  backBtn: {
    alignSelf: 'flex-start',
    margin: 0,
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    overflow: 'hidden',
    height: 58,
    alignItems: 'center',
  },
  prefix: {
    paddingHorizontal: Spacing.md,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  phoneField: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyMd,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    lineHeight: 22,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  submitBtn: {
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  submitBtnContent: {
    height: 50,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
});
