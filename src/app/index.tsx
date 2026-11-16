import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useOnboardingStore } from '@/features/auth/stores/onboarding-store';

export default function Index() {
  const signedIn = useAuthStore((state) => state.status === 'signed_in');
  const onboardingCompleted = useOnboardingStore((state) => state.completed);

  if (signedIn) {
    return <Redirect href="/home" />;
  }
  return <Redirect href={onboardingCompleted ? '/login' : '/welcome'} />;
}
