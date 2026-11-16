import { create } from 'zustand';

import { t } from '@/shared/i18n';

import type { User } from '../types';

type AuthStatus = 'loading' | 'signed_out' | 'signed_in';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  setUser: (user) => set({ user, status: 'signed_in' }),
  clear: () => set({ user: null, status: 'signed_out' }),
}));

export function useCurrentUser(): User {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    throw new Error(t.errors.noSession);
  }
  return user;
}

export function useUserId(): string {
  return useCurrentUser().id;
}
