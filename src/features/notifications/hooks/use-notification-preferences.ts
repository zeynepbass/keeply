import { useMutation, useQuery } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/stores/auth-store';
import { productService } from '@/features/products/services/product-service';
import { queryClient } from '@/shared/lib/query-client';
import { queryKeys } from '@/shared/lib/query-keys';

import { notificationScheduler } from '../services/notification-scheduler';
import { preferencesService } from '../services/preferences-service';
import type { NotificationPreference } from '../types';

export function useNotificationPreferences() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.notificationPreferences.detail(userId),
    queryFn: () => preferencesService.get(userId),
  });
}

export function useUpdateNotificationPreferences() {
  const userId = useUserId();
  const key = queryKeys.notificationPreferences.detail(userId);
  return useMutation({
    mutationFn: async (changes: Partial<NotificationPreference>) => {
      const preferences = await preferencesService.update(userId, changes);
      const outcome = await notificationScheduler.syncAll(userId, await productService.list(userId), preferences);
      return { preferences, outcome };
    },
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPreference>(key);
      if (previous) {
        queryClient.setQueryData<NotificationPreference>(key, { ...previous, ...changes });
      }
      return { previous };
    },
    onError: (_error, _changes, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: ({ preferences }) => {
      queryClient.setQueryData(key, preferences);
    },
  });
}
