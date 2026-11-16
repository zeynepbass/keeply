import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/auth-service';
import { useAuthStore, useCurrentUser } from '@/features/auth/stores/auth-store';
import { queryClient } from '@/shared/lib/query-client';

import { accountDataService } from '../services/account-data-service';

export function useUpdateProfile() {
  const user = useCurrentUser();
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (changes: { name: string; email: string }) => authService.updateProfile(user.id, changes),
    onSuccess: setUser,
  });
}

export function useChangePassword() {
  const user = useCurrentUser();
  return useMutation({
    mutationFn: ({ currentPassword, password }: { currentPassword: string; password: string }) =>
      authService.changePassword(user.id, currentPassword, password),
  });
}

export function useExportData() {
  const user = useCurrentUser();
  return useMutation({ mutationFn: () => accountDataService.exportData(user) });
}

export function useClearData() {
  const user = useCurrentUser();
  return useMutation({
    mutationFn: () => accountDataService.clearData(user.id),
    onSuccess: () => queryClient.invalidateQueries({ predicate: (query) => query.queryKey[1] === user.id }),
  });
}

export function useDeleteAccount() {
  const user = useCurrentUser();
  const clear = useAuthStore((state) => state.clear);
  return useMutation({
    mutationFn: () => accountDataService.deleteAccount(user.id),
    onSuccess: () => {
      queryClient.clear();
      clear();
    },
  });
}
