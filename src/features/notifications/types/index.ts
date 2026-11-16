import type { IsoDate } from '@/shared/utils/date';

export const REMINDER_LEAD_DAYS = [7, 14, 30] as const;

export type ReminderLeadDay = (typeof REMINDER_LEAD_DAYS)[number];

export interface NotificationPreference {
  warrantyReminders: boolean;
  returnReminders: boolean;
  productUpdates: boolean;
  pushEnabled: boolean;
  leadDays: ReminderLeadDay[];
}

export interface Reminder {
  id: string;
  title: string;
  note: string | null;
  date: IsoDate;
  productId: string | null;
  notificationId: string | null;
  createdAt: string;
}

export type ReminderInput = Pick<Reminder, 'title' | 'note' | 'date' | 'productId'>;

export type InboxKind = 'warranty_expiring' | 'warranty_expired' | 'return_approaching' | 'reminder' | 'welcome';

export interface InboxItem {
  id: string;
  kind: InboxKind;
  title: string;
  body: string;
  productId: string | null;
  occurredAt: string;
  read: boolean;
}

export type ScheduleOutcome =
  | { status: 'scheduled'; count: number }
  | { status: 'skipped'; reason: 'disabled' | 'no_future_dates' }
  | { status: 'permission_denied' }
  | { status: 'failed' };
