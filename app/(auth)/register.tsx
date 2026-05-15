import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/input';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth.schema';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', terms: undefined as any },
  });

  async function onSubmit(data: RegisterFormValues) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    // After register → verify phone
    router.push({ pathname: '/(auth)/verify-phone/[user_id]', params: { user_id: 'mock-user-id' } });
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
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: C.outlineVariant }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={C.onSurfaceVariant} />
        </Pressable>

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
                  <Pressable onPress={() => setShowPwd((v) => !v)} hitSlop={8}>
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
                  <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
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
                  {' et la politique de confidentialité.'}
                </Text>
              </View>
            )}
          />
          {errors.terms && (
            <Text style={[Typography.caption, { color: C.error, marginLeft: Spacing.xs }]}>
              {errors.terms.message}
            </Text>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            style={[
              styles.submitBtn,
              { backgroundColor: C.primary, opacity: loading ? 0.7 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.12 }]}>
                {"S'inscrire"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>
            {'Déjà un compte ? '}
            <Text
              style={{ color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }}
              onPress={() => router.push('/(auth)/login')}
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
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
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
  submitBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: '#633f00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
});
