import type { Product } from '@/features/products/types';
import { getProductTitle } from '@/features/products/services/product-display';
import { getReturnDeadline, URGENT_RETURN_THRESHOLD_DAYS } from '@/features/returns/services/return-calculator';
import { EXPIRING_THRESHOLD_DAYS, getWarranty } from '@/features/warranties/services/warranty-calculator';
import { t } from '@/shared/i18n';
import { addDays, compareIsoDates, differenceInDays, isoToLocalDate, toIsoDate, type IsoDate } from '@/shared/utils/date';

import type { InboxItem, NotificationPreference, Reminder } from '../types';
import { REMINDER_HOUR } from './reminder-planner';

const EXPIRED_VISIBILITY_DAYS = 30;

export interface InboxInput {
  products: Product[];
  reminders: Reminder[];
  preferences: NotificationPreference;
  userCreatedAt: string;
  readIds: Set<string>;
  now?: Date;
}

function occurredOn(date: IsoDate, notBefore: string, now: Date): string {
  const candidate = isoToLocalDate(date, REMINDER_HOUR, 0);
  const floor = new Date(notBefore);
  const value = candidate < floor ? floor : candidate;
  return (value > now ? now : value).toISOString();
}

export function buildInbox({ products, reminders, preferences, userCreatedAt, readIds, now = new Date() }: InboxInput): InboxItem[] {
  const reference = toIsoDate(now);
  const items: Omit<InboxItem, 'read'>[] = [];

  products.forEach((product) => {
    const name = getProductTitle(product);
    const warranty = getWarranty(product, reference);
    if (warranty && preferences.warrantyReminders) {
      if (warranty.status === 'expiring') {
        const lead = [...preferences.leadDays].sort((a, b) => a - b).find((days) => days >= warranty.remainingDays) ?? EXPIRING_THRESHOLD_DAYS;
        items.push({
          id: `warranty_expiring:${product.id}:${warranty.endDate}`,
          kind: 'warranty_expiring',
          title: t.notifications.items.warrantyExpiringTitle,
          body: t.notifications.items.warrantyExpiringBody(name, warranty.remainingDays),
          productId: product.id,
          occurredAt: occurredOn(addDays(warranty.endDate, -lead), product.createdAt, now),
        });
      } else if (warranty.status === 'expired' && differenceInDays(reference, warranty.endDate) <= EXPIRED_VISIBILITY_DAYS) {
        items.push({
          id: `warranty_expired:${product.id}:${warranty.endDate}`,
          kind: 'warranty_expired',
          title: t.notifications.items.warrantyExpiredTitle,
          body: t.notifications.items.warrantyExpiredBody(name),
          productId: product.id,
          occurredAt: occurredOn(warranty.endDate, product.createdAt, now),
        });
      }
    }
    const returnInfo = getReturnDeadline(product, reference);
    if (returnInfo && preferences.returnReminders && returnInfo.status === 'urgent') {
      items.push({
        id: `return_approaching:${product.id}:${returnInfo.deadline}`,
        kind: 'return_approaching',
        title: t.notifications.items.returnTitle,
        body: t.notifications.items.returnBody(name, returnInfo.remainingDays),
        productId: product.id,
        occurredAt: occurredOn(addDays(returnInfo.deadline, -URGENT_RETURN_THRESHOLD_DAYS), product.createdAt, now),
      });
    }
  });

  reminders
    .filter((reminder) => compareIsoDates(reminder.date, reference) <= 0)
    .forEach((reminder) => {
      items.push({
        id: `reminder:${reminder.id}`,
        kind: 'reminder',
        title: t.notifications.items.reminderTitle(reminder.title),
        body: reminder.note ?? '',
        productId: reminder.productId,
        occurredAt: occurredOn(reminder.date, reminder.createdAt, now),
      });
    });

  items.push({
    id: 'welcome',
    kind: 'welcome',
    title: t.notifications.items.welcomeTitle,
    body: t.notifications.items.welcomeBody,
    productId: null,
    occurredAt: userCreatedAt,
  });

  return items
    .map((item) => ({ ...item, read: readIds.has(item.id) }))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export type InboxSection = 'today' | 'thisWeek' | 'earlier';

export function groupInbox(items: InboxItem[], now: Date = new Date()): { section: InboxSection; items: InboxItem[] }[] {
  const reference = toIsoDate(now);
  const sections: Record<InboxSection, InboxItem[]> = { today: [], thisWeek: [], earlier: [] };
  items.forEach((item) => {
    const age = differenceInDays(reference, toIsoDate(new Date(item.occurredAt)));
    sections[age <= 0 ? 'today' : age < 7 ? 'thisWeek' : 'earlier'].push(item);
  });
  return (['today', 'thisWeek', 'earlier'] as const).filter((section) => sections[section].length > 0).map((section) => ({ section, items: sections[section] }));
}
