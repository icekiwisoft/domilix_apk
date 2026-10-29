import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Identifiant requis'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

// No password confirmation (UI-02): the backend RegisterDto takes name, email?,
// phone_number? and password only, and the field shows a "show password" toggle.
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(80, 'Nom trop long'),
  email: z.string().trim().email('Email invalide').optional().or(z.literal('')),
  phone: z
    .string()
    .min(9, 'Numéro invalide')
    .regex(/^[0-9]+$/, 'Numéro invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  terms: z.literal(true, { errorMap: () => ({ message: "Acceptez les conditions d'utilisation" }) }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, 'Code à 6 chiffres requis'),
    password: z.string().min(8, 'Au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string().min(8, 'Au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export type LoginFormValues = z.infer<typeof loginSchema>;
// helper utilisé dans onSubmit pour router vers email ou phone_number
export function resolveLoginDto(identifier: string, password: string) {
  const isEmail = identifier.includes('@');
  return isEmail
    ? { email: identifier, password }
    : { phone_number: identifier, password };
}
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
