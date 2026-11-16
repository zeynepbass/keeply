import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useDemoSignIn } from '@/features/demo/hooks/use-demo-sign-in';
import { Screen } from '@/shared/components/layout/screen';
import { ErrorState, LoadingState } from '@/shared/components/ui';

export default function DemoScreen() {
  const signedIn = useAuthStore((state) => state.status === 'signed_in');
  const demo = useDemoSignIn();
  const { mutate } = demo;

  useEffect(() => {
    if (env.demoEnabled && !signedIn) {
      mutate();
    }
  }, [mutate, signedIn]);

  if (!env.demoEnabled) {
    return <Redirect href="/" />;
  }
  if (signedIn) {
    return <Redirect href="/home" />;
  }
  return <Screen>{demo.isError ? <ErrorState error={demo.error} onRetry={() => mutate()} /> : <LoadingState />}</Screen>;
}
