import type { Product } from '@/features/products/types';
import { getProductTitle } from '@/features/products/services/product-display';
import { t } from '@/shared/i18n';
import { addDays, isoToLocalDate, today, type IsoDate } from '@/shared/utils/date';

import type { NotificationPreference } from '../types';

export const REMINDER_HOUR = 10;
export const RETURN_REMINDER_DAYS = [3, 1] as const;

export interface PlannedNotification {
  key: string;
  date: Date;
  title: string;
  body: string;
  productId: string | null;
}

export const DEFAULT_PREFERENCES: NotificationPreference = {
  warrantyReminders: true,
  returnReminders: true,
  productUpdates: false,
  pushEnabled: true,
  leadDays: [14, 30],
};

function at(date: IsoDate): Date {
  return isoToLocalDate(date, REMINDER_HOUR, 0);
}

export function planProductReminders(product: Product, preferences: NotificationPreference, now: Date = new Date()): PlannedNotification[] {
  if (!preferences.pushEnabled) {
    return [];
  }
  const name = getProductTitle(product);
  const planned: PlannedNotification[] = [];

  if (preferences.warrantyReminders && product.hasWarranty && product.warrantyEndDate) {
    const end = product.warrantyEndDate;
    [...preferences.leadDays]
      .sort((a, b) => b - a)
      .forEach((lead) => {
        planned.push({
          key: `warranty-${lead}`,
          date: at(addDays(end, -lead)),
          title: t.notifications.push.warrantyTitle,
          body: t.notifications.push.warrantyBody(name, lead),
          productId: product.id,
        });
      });
    planned.push({
      key: 'warranty-end',
      date: at(end),
      title: t.notifications.push.warrantyEndTitle,
      body: t.notifications.push.warrantyEndBody(name),
      productId: product.id,
    });
  }

  if (preferences.returnReminders && product.returnDeadline) {
    const deadline = product.returnDeadline;
    RETURN_REMINDER_DAYS.forEach((days) => {
      planned.push({
        key: `return-${days}`,
        date: at(addDays(deadline, -days)),
        title: t.notifications.push.returnTitle,
        body: t.notifications.push.returnBody(name, days),
        productId: product.id,
      });
    });
  }

  return planned.filter((item) => item.date.getTime() > now.getTime()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function planUserReminderDate(date: IsoDate, now: Date = new Date()): Date | null {
  const target = at(date);
  if (target.getTime() > now.getTime()) {
    return target;
  }
  if (date === today(now)) {
    return new Date(now.getTime() + 60_000);
  }
  return null;
}
