import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import type { Product } from '@/features/products/types';

import type { NotificationPreference, Reminder } from '../types';
import { buildInbox, groupInbox } from './inbox-builder';
import { notificationScheduler } from './notification-scheduler';
import { preferencesService } from './preferences-service';
import { DEFAULT_PREFERENCES, planProductReminders, planUserReminderDate } from './reminder-planner';
import { reminderService } from './reminder-service';

type MockedNotifications = typeof Notifications & {
  __scheduled: Map<string, unknown>;
  __permission: { granted: boolean; canAskAgain: boolean };
};
const mocked = Notifications as MockedNotifications;

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Galaxy S24',
  brand: 'Samsung',
  model: null,
  category: 'electronics',
  imageUri: null,
  price: null,
  purchaseDate: '2026-11-10',
  storeName: 'Teknosa',
  salesChannel: 'online',
  hasWarranty: true,
  warrantyMonths: 24,
  warrantyStartDate: '2024-12-30',
  warrantyEndDate: '2026-12-30',
  returnDeadline: '2026-11-24',
  notes: null,
  createdAt: '2026-11-10T08:00:00.000Z',
  updatedAt: '2026-11-10T08:00:00.000Z',
  ...overrides,
});

const prefs = (overrides: Partial<NotificationPreference> = {}): NotificationPreference => ({ ...DEFAULT_PREFERENCES, ...overrides });
const now = new Date(2026, 10, 16, 12, 0);

describe('reminder planner', () => {
  it('plans warranty reminders by lead days at 10:00 and skips past dates', () => {
    const plan = planProductReminders(product({ warrantyEndDate: '2026-12-10', returnDeadline: null }), prefs({ leadDays: [7, 14, 30] }), now);
    expect(plan.map((item) => item.key)).toEqual(['warranty-14', 'warranty-7', 'warranty-end']);
    expect(plan[0].date).toEqual(new Date(2026, 10, 26, 10, 0));
    expect(plan[0].body).toContain('Samsung Galaxy S24');
  });

  it('plans return reminders 3 and 1 days before the deadline', () => {
    const plan = planProductReminders(product({ hasWarranty: false, warrantyEndDate: null }), prefs(), now);
    expect(plan.map((item) => [item.key, item.date.getDate()])).toEqual([
      ['return-3', 21],
      ['return-1', 23],
    ]);
  });

  it('plans nothing when push or the reminder type is disabled', () => {
    expect(planProductReminders(product(), prefs({ pushEnabled: false }), now)).toEqual([]);
    expect(planProductReminders(product(), prefs({ warrantyReminders: false, returnReminders: false }), now)).toEqual([]);
  });

  it('schedules user reminders at 10:00 or shortly after for today', () => {
    expect(planUserReminderDate('2026-11-20', now)).toEqual(new Date(2026, 10, 20, 10, 0));
    expect(planUserReminderDate('2026-11-16', now)?.getTime()).toBe(now.getTime() + 60_000);
    expect(planUserReminderDate('2026-11-15', now)).toBeNull();
  });
});

describe('inbox builder', () => {
  const reminder: Reminder = {
    id: 'r1',
    title: 'Klima bakımı',
    note: null,
    date: '2026-11-16',
    productId: null,
    notificationId: null,
    createdAt: '2026-11-01T10:00:00.000Z',
  };

  it('derives warranty, return, reminder and welcome items with read state', () => {
    const items = buildInbox({
      products: [
        product({ id: 'a', warrantyEndDate: '2026-11-30', returnDeadline: '2026-11-18' }),
        product({ id: 'b', warrantyEndDate: '2026-11-10', returnDeadline: null }),
        product({ id: 'c', warrantyEndDate: '2026-08-01', returnDeadline: null }),
      ],
      reminders: [reminder, { ...reminder, id: 'r2', date: '2026-12-01' }],
      preferences: prefs(),
      userCreatedAt: '2026-11-01T09:00:00.000Z',
      readIds: new Set(['welcome']),
      now,
    });
    expect(items.map((item) => item.kind).sort()).toEqual(['reminder', 'return_approaching', 'warranty_expired', 'warranty_expiring', 'welcome']);
    expect(items.find((item) => item.kind === 'welcome')?.read).toBe(true);
    expect(items.find((item) => item.kind === 'warranty_expiring')?.body).toContain('14 gün');
    expect(items.every((item) => new Date(item.occurredAt) <= now)).toBe(true);
  });

  it('respects disabled reminder preferences and groups by age', () => {
    const items = buildInbox({
      products: [product({ warrantyEndDate: '2026-11-30', returnDeadline: '2026-11-18' })],
      reminders: [],
      preferences: prefs({ warrantyReminders: false, returnReminders: false }),
      userCreatedAt: '2026-11-01T09:00:00.000Z',
      readIds: new Set(),
      now,
    });
    expect(items.map((item) => item.kind)).toEqual(['welcome']);
    expect(groupInbox(items, now).map((group) => group.section)).toEqual(['earlier']);
  });
});

describe('notification scheduler', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mocked.__scheduled.clear();
    mocked.__permission.granted = true;
    mocked.__permission.canAskAgain = true;
  });

  it('replaces earlier notifications when a product is synced again', async () => {
    const item = product({ warrantyEndDate: '2027-06-01', returnDeadline: null });
    const first = await notificationScheduler.syncProduct('u1', item, prefs());
    expect(first).toEqual({ status: 'scheduled', count: 3 });
    await notificationScheduler.syncProduct('u1', item, prefs({ leadDays: [7] }));
    expect(mocked.__scheduled.size).toBe(2);
    await notificationScheduler.cancelForProduct('u1', item.id);
    expect(mocked.__scheduled.size).toBe(0);
  });

  it('reports a denied permission instead of claiming success', async () => {
    mocked.__permission.granted = false;
    mocked.__permission.canAskAgain = false;
    expect(await notificationScheduler.syncProduct('u1', product(), prefs(), { prompt: true })).toEqual({ status: 'permission_denied' });
    expect(mocked.__scheduled.size).toBe(0);
  });

  it('skips scheduling when push is disabled', async () => {
    expect(await notificationScheduler.syncAll('u1', [product()], prefs({ pushEnabled: false }))).toEqual({ status: 'skipped', reason: 'disabled' });
  });

  it('stores preferences with valid lead days', async () => {
    const saved = await preferencesService.update('u1', { leadDays: [30, 7], pushEnabled: false });
    expect(saved).toMatchObject({ leadDays: [7, 30], pushEnabled: false });
    expect((await preferencesService.update('u1', { leadDays: [] })).leadDays).toEqual(DEFAULT_PREFERENCES.leadDays);
  });

  it('saves user reminders and cancels their notification on delete', async () => {
    const date = '2099-01-15';
    const { reminder, outcome } = await reminderService.create('u1', { title: 'Filtre değişimi', note: null, date, productId: null }, prefs());
    expect(outcome).toEqual({ status: 'scheduled', count: 1 });
    expect(mocked.__scheduled.size).toBe(1);
    await reminderService.remove('u1', reminder.id);
    expect(mocked.__scheduled.size).toBe(0);
    expect(await reminderService.list('u1')).toEqual([]);
  });
});
