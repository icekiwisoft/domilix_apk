import { client } from './api.client';
import type { User, RegisterDto, LoginDto, AuthTokens } from '@/types/auth';

export const AuthService = {
  register: (dto: RegisterDto) =>
    client.post<{ user: User } & AuthTokens>('/auth/register', dto).then((r) => r.data),

  login: (dto: LoginDto) =>
    client.post<{ user: User } & AuthTokens>('/auth/login', dto).then((r) => r.data),

  logout: () => client.post('/auth/logout').then((r) => r.data),

  me: () =>
    client.get<unknown>('/auth/me').then((r) => {
      const data = r.data as Record<string, unknown>;
      return ((data.user ?? data) as User);
    }),

  updateProfile: (dto: { name?: string; email?: string; phone_number?: string }) =>
    client.put<unknown>('/auth/me', dto).then((r) => {
      const data = r.data as Record<string, unknown>;
      return ((data.user ?? data) as User);
    }),

  updateAnnouncerProfile: (formData: FormData) =>
    client
      .put('/auth/announcer-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  verifyPhone: (userId: string, code: string) =>
    client
      .post(`/auth/verifyPhone/${userId}`, { verification_code: code })
      .then((r) => r.data),

  resendVerificationCode: (userId: string) =>
    client.post(`/auth/resendVerificationCode/${userId}`).then((r) => r.data),

  sendResetEmail: (email: string) =>
    client.post('/auth/sendEmail', { email }).then((r) => r.data),

  resetPassword: (dto: {
    email: string;
    code: string;
    password: string;
    password_confirmation: string;
  }) => client.post('/auth/resetPassword', dto).then((r) => r.data),

  changePassword: (dto: {
    old_password?: string;
    new_password: string;
    new_password_confirmation: string;
  }) => client.post('/auth/changePassword', dto).then((r) => r.data),
};
