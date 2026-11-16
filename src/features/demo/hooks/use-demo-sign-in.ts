import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useOnboardingStore } from '@/features/auth/stores/onboarding-store';
import { queryClient } from '@/shared/lib/query-client';

import { demoService } from '../services/demo-service';

export function useDemoSignIn() {
  const setUser = useAuthStore((state) => state.setUser);
  const completeOnboarding = useOnboardingStore((state) => state.complete);
  return useMutation({
    mutationFn: () => demoService.signIn(),
    onSuccess: (user) => {
      queryClient.clear();
      completeOnboarding();
      setUser(user);
    },
  });
}
