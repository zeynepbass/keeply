import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { Product } from '@/features/products/types';
import { readJson, storageKey, writeJson } from '@/shared/lib/storage';

import type { NotificationPreference, ScheduleOutcome } from '../types';
import { planProductReminders, type PlannedNotification } from './reminder-planner';

const CHANNEL_ID = 'reminders';

type ScheduledMap = Record<string, string[]>;

const mapKey = (userId: string) => storageKey('user', userId, 'scheduled-notifications');

export type PermissionState = 'granted' | 'undetermined' | 'denied';

export const notificationPermissions = {
  async status(): Promise<PermissionState> {
    const result = await Notifications.getPermissionsAsync();
    if (result.granted) {
      return 'granted';
    }
    return result.canAskAgain ? 'undetermined' : 'denied';
  },

  async request(): Promise<PermissionState> {
    const current = await this.status();
    if (current !== 'undetermined') {
      return current;
    }
    const result = await Notifications.requestPermissionsAsync();
    return result.granted ? 'granted' : 'denied';
  },
};

export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Hatırlatmalar',
      importance: AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleOne(item: Pick<PlannedNotification, 'date' | 'title' | 'body' | 'productId'>): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title: item.title, body: item.body, data: { productId: item.productId } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date, channelId: CHANNEL_ID },
  });
}

export async function cancelOne(notificationId: string | null): Promise<void> {
  if (!notificationId) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    return;
  }
}

async function cancelForProduct(userId: string, productId: string): Promise<void> {
  const map = await readJson<ScheduledMap>(mapKey(userId), {});
  await Promise.all((map[productId] ?? []).map(cancelOne));
  delete map[productId];
  await writeJson(mapKey(userId), map);
}

async function scheduleForProduct(userId: string, product: Product, preferences: NotificationPreference, now: Date): Promise<number> {
  const plan = planProductReminders(product, preferences, now);
  const ids: string[] = [];
  for (const item of plan) {
    ids.push(await scheduleOne(item));
  }
  const map = await readJson<ScheduledMap>(mapKey(userId), {});
  map[product.id] = ids;
  await writeJson(mapKey(userId), map);
  return ids.length;
}

export const notificationScheduler = {
  async syncProduct(userId: string, product: Product, preferences: NotificationPreference, options: { prompt?: boolean } = {}): Promise<ScheduleOutcome> {
    try {
      await cancelForProduct(userId, product.id);
      if (!preferences.pushEnabled) {
        return { status: 'skipped', reason: 'disabled' };
      }
      const permission = options.prompt ? await notificationPermissions.request() : await notificationPermissions.status();
      if (permission !== 'granted') {
        return { status: 'permission_denied' };
      }
      const count = await scheduleForProduct(userId, product, preferences, new Date());
      return count > 0 ? { status: 'scheduled', count } : { status: 'skipped', reason: 'no_future_dates' };
    } catch {
      return { status: 'failed' };
    }
  },

  async syncAll(userId: string, products: Product[], preferences: NotificationPreference): Promise<ScheduleOutcome> {
    try {
      const map = await readJson<ScheduledMap>(mapKey(userId), {});
      await Promise.all(Object.values(map).flat().map(cancelOne));
      await writeJson(mapKey(userId), {});
      if (!preferences.pushEnabled) {
        return { status: 'skipped', reason: 'disabled' };
      }
      if ((await notificationPermissions.status()) !== 'granted') {
        return { status: 'permission_denied' };
      }
      const now = new Date();
      let count = 0;
      for (const product of products) {
        count += await scheduleForProduct(userId, product, preferences, now);
      }
      return count > 0 ? { status: 'scheduled', count } : { status: 'skipped', reason: 'no_future_dates' };
    } catch {
      return { status: 'failed' };
    }
  },

  cancelForProduct,

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      return;
    }
  },
};
