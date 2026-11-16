import { activityService } from '@/features/activity/services/activity-service';
import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';
import { createId } from '@/shared/lib/id';
import { createCollection } from '@/shared/lib/storage';
import { compareIsoDates } from '@/shared/utils/date';

import type { NotificationPreference, Reminder, ReminderInput, ScheduleOutcome } from '../types';
import { cancelOne, notificationPermissions, scheduleOne } from './notification-scheduler';
import { planUserReminderDate } from './reminder-planner';

export const reminderRepository = createCollection<Reminder>('reminders', t.common.notFound);

export const reminderService = {
  async list(userId: string): Promise<Reminder[]> {
    const items = await reminderRepository.list(userId);
    return [...items].sort((a, b) => compareIsoDates(a.date, b.date));
  },

  async create(userId: string, input: ReminderInput, preferences: NotificationPreference): Promise<{ reminder: Reminder; outcome: ScheduleOutcome }> {
    let notificationId: string | null = null;
    let outcome: ScheduleOutcome;
    const date = planUserReminderDate(input.date);
    if (!preferences.pushEnabled) {
      outcome = { status: 'skipped', reason: 'disabled' };
    } else if (!date) {
      outcome = { status: 'skipped', reason: 'no_future_dates' };
    } else if ((await notificationPermissions.request()) !== 'granted') {
      outcome = { status: 'permission_denied' };
    } else {
      try {
        notificationId = await scheduleOne({
          date,
          title: t.notifications.push.reminderTitle,
          body: input.note ? `${input.title} — ${input.note}` : input.title,
          productId: input.productId,
        });
        outcome = { status: 'scheduled', count: 1 };
      } catch {
        outcome = { status: 'failed' };
      }
    }
    const reminder: Reminder = {
      id: createId(),
      title: input.title.trim(),
      note: input.note?.trim() || null,
      date: input.date,
      productId: input.productId,
      notificationId,
      createdAt: new Date().toISOString(),
    };
    await reminderRepository.insert(userId, reminder);
    await activityService.log(userId, 'reminder_scheduled', reminder.title, reminder.productId);
    return { reminder, outcome };
  },

  async remove(userId: string, reminderId: string): Promise<void> {
    const reminder = await reminderRepository.get(userId, reminderId);
    if (!reminder) {
      throw new AppError('not_found', t.common.notFound);
    }
    await cancelOne(reminder.notificationId);
    await reminderRepository.remove(userId, reminderId);
  },

  async removeForProduct(userId: string, productId: string): Promise<void> {
    const removed = await reminderRepository.removeWhere(userId, (reminder) => reminder.productId === productId);
    await Promise.all(removed.map((reminder) => cancelOne(reminder.notificationId)));
  },
};
