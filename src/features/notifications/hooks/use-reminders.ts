import { useMutation, useQuery } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/stores/auth-store';
import { queryClient } from '@/shared/lib/query-client';
import { queryKeys } from '@/shared/lib/query-keys';

import { preferencesService } from '../services/preferences-service';
import { reminderService } from '../services/reminder-service';
import type { ReminderInput } from '../types';

function invalidate(userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.all(userId) }),
  ]);
}

export function useReminders() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.reminders.all(userId),
    queryFn: () => reminderService.list(userId),
  });
}

export function useCreateReminder() {
  const userId = useUserId();
  return useMutation({
    mutationFn: async (input: ReminderInput) => reminderService.create(userId, input, await preferencesService.get(userId)),
    onSuccess: () => invalidate(userId),
  });
}

export function useDeleteReminder() {
  const userId = useUserId();
  return useMutation({
    mutationFn: (reminderId: string) => reminderService.remove(userId, reminderId),
    onSuccess: () => invalidate(userId),
  });
}
