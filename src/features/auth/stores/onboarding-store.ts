import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storageKey } from '@/shared/lib/storage';

interface OnboardingState {
  completed: boolean;
  complete: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      complete: () => set({ completed: true }),
    }),
    {
      name: storageKey('onboarding'),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
