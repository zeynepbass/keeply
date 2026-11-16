import { useEffect } from 'react';

import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';

export function useSessionRestore(): boolean {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    let active = true;
    authService
      .restoreSession()
      .then((user) => {
        if (!active) {
          return;
        }
        if (user) {
          useAuthStore.getState().setUser(user);
        } else {
          useAuthStore.getState().clear();
        }
      })
      .catch(() => {
        if (active) {
          useAuthStore.getState().clear();
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return status !== 'loading';
}
