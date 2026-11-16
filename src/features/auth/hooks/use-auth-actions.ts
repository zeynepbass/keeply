import { useMutation } from '@tanstack/react-query';

import { notificationScheduler } from '@/features/notifications/services/notification-scheduler';
import { queryClient } from '@/shared/lib/query-client';

import type { LoginValues, RegisterValues } from '../schemas/auth-schemas';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (values: LoginValues) => authService.login(values.email, values.password),
    onSuccess: (user) => {
      queryClient.clear();
      setUser(user);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (values: RegisterValues) =>
      authService.register({ name: values.name, email: values.email, password: values.password }),
    onSuccess: (user) => {
      queryClient.clear();
      setUser(user);
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear);
  return useMutation({
    mutationFn: async () => {
      await notificationScheduler.cancelAll();
      await authService.logout();
    },
    onSettled: () => {
      queryClient.clear();
      clear();
    },
  });
}

export function useAccountLookup() {
  return useMutation({
    mutationFn: (email: string) => authService.accountExists(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authService.resetPassword(email, password),
  });
}
