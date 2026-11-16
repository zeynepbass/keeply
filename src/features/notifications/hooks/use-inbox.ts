import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentUser } from '@/features/auth/stores/auth-store';
import { useProducts } from '@/features/products/hooks/use-products';
import { queryClient } from '@/shared/lib/query-client';
import { queryKeys } from '@/shared/lib/query-keys';

import { buildInbox, groupInbox } from '../services/inbox-builder';
import { inboxStateService } from '../services/preferences-service';
import { DEFAULT_PREFERENCES } from '../services/reminder-planner';
import { useNotificationPreferences } from './use-notification-preferences';
import { useReminders } from './use-reminders';

export function useInbox() {
  const user = useCurrentUser();
  const products = useProducts();
  const reminders = useReminders();
  const preferences = useNotificationPreferences();
  const readIds = useQuery({
    queryKey: queryKeys.inboxState.detail(user.id),
    queryFn: () => inboxStateService.readIds(user.id),
  });

  const items = useMemo(
    () =>
      buildInbox({
        products: products.data ?? [],
        reminders: reminders.data ?? [],
        preferences: preferences.data ?? DEFAULT_PREFERENCES,
        userCreatedAt: user.createdAt,
        readIds: new Set(readIds.data ?? []),
      }),
    [products.data, reminders.data, preferences.data, user.createdAt, readIds.data],
  );

  return {
    items,
    sections: useMemo(() => groupInbox(items), [items]),
    unreadCount: items.filter((item) => !item.read).length,
    isPending: products.isPending || reminders.isPending || preferences.isPending || readIds.isPending,
    error: products.error ?? reminders.error ?? preferences.error ?? readIds.error,
    refetch: () => Promise.all([products.refetch(), reminders.refetch(), readIds.refetch()]),
  };
}

export function useMarkInboxRead() {
  const user = useCurrentUser();
  return useMutation({
    mutationFn: (ids: string[]) => inboxStateService.markRead(user.id, ids),
    onSuccess: (next) => queryClient.setQueryData(queryKeys.inboxState.detail(user.id), next),
  });
}
