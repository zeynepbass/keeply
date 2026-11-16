import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { useSessionRestore } from '@/features/auth/hooks/use-session-restore';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useOnboardingStore } from '@/features/auth/stores/onboarding-store';
import { AppProviders } from '@/providers/app-providers';
import { useAppFonts } from '@/shared/hooks/use-app-fonts';

SplashScreen.preventAutoHideAsync();

function useOnboardingHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useOnboardingStore.persist.hasHydrated());
  useEffect(() => useOnboardingStore.persist.onFinishHydration(() => setHydrated(true)), []);
  return hydrated;
}

function RootNavigator() {
  const signedIn = useAuthStore((state) => state.status === 'signed_in');
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="legal/[doc]" />
      <Stack.Screen name="demo" options={{ animation: 'fade' }} />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="products/new" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen name="products/[id]/index" />
        <Stack.Screen name="products/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="scanner" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const sessionReady = useSessionRestore();
  const onboardingReady = useOnboardingHydrated();
  const ready = fontsReady && sessionReady && onboardingReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
