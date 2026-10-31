import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';
import { signOutGoogle } from '@/hooks/use-google-signin';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginDto, RegisterDto } from '@/types/auth';

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    queryFn: AuthService.me,
    enabled: !!accessToken,
  });
}

function extractTokens(data: Record<string, unknown>) {
  // API nests tokens under `authorisation: { token, refresh_token }`
  const auth = data.authorisation as Record<string, unknown> | undefined;
  const access = (
    auth?.token ?? data.access_token ?? data.token ?? data.accessToken ?? data.jwt
  ) as string | undefined;
  const refresh = (
    auth?.refresh_token ?? data.refresh_token ?? data.refreshToken
  ) as string | undefined;
  return { access, refresh };
}

export function useLogin() {
  const { setTokens, setUser } = useAuthStore.getState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: LoginDto) => AuthService.login(dto),
    onSuccess: (data) => {
      const raw = data as unknown as Record<string, unknown>;
      const { access, refresh } = extractTokens(raw);
      if (access) setTokens(access, refresh);
      const user = raw.user as typeof data.user | undefined;
      if (user) {
        setUser(user);
        qc.setQueryData(['me'], user);
      }
    },
  });
}

export function useFirebaseLogin() {
  const { setTokens, setUser } = useAuthStore.getState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idToken: string) => AuthService.firebaseLogin(idToken),
    onSuccess: (data) => {
      const raw = data as unknown as Record<string, unknown>;
      const { access, refresh } = extractTokens(raw);
      if (access) setTokens(access, refresh);
      const user = raw.user as typeof data.user | undefined;
      if (user) {
        setUser(user);
        qc.setQueryData(['me'], user);
      }
    },
  });
}

export function useRegister() {
  const { setTokens, setUser } = useAuthStore.getState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegisterDto) => AuthService.register(dto),
    onSuccess: (data) => {
      const raw = data as unknown as Record<string, unknown>;
      const { access, refresh } = extractTokens(raw);
      if (access) setTokens(access, refresh);
      const user = raw.user as typeof data.user | undefined;
      if (user) {
        setUser(user);
        qc.setQueryData(['me'], user);
      }
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore.getState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AuthService.logout,
    onSettled: () => {
      clearAuth();
      qc.clear();
      void signOutGoogle();
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AuthService.updateProfile,
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });
}

export function useUpdateAnnouncerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => AuthService.updateAnnouncerProfile(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useVerifyPhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) =>
      AuthService.verifyPhone(userId, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useResendVerificationCode() {
  return useMutation({
    mutationFn: (userId: string) => AuthService.resendVerificationCode(userId),
  });
}

export function useSendResetEmail() {
  return useMutation({
    mutationFn: (email: string) => AuthService.sendResetEmail(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: AuthService.resetPassword,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: AuthService.changePassword,
  });
}

export function useBecomeAnnouncer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AuthService.becomeAnnouncer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useDeleteAccount() {
  const { clearAuth } = useAuthStore.getState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => AuthService.deleteAccount(password),
    onSuccess: () => {
      clearAuth();
      qc.clear();
    },
  });
}

export function useSendEmailVerification() {
  return useMutation({
    mutationFn: AuthService.sendEmailVerification,
  });
}

export function useVerifyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => AuthService.verifyEmail(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}
