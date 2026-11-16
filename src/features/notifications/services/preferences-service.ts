import { readJson, storageKey, writeJson } from '@/shared/lib/storage';

import { REMINDER_LEAD_DAYS, type NotificationPreference } from '../types';
import { DEFAULT_PREFERENCES } from './reminder-planner';

const key = (userId: string) => storageKey('user', userId, 'notification-preferences');

function sanitize(value: Partial<NotificationPreference>): NotificationPreference {
  const merged = { ...DEFAULT_PREFERENCES, ...value };
  const leadDays = REMINDER_LEAD_DAYS.filter((days) => merged.leadDays.includes(days));
  return { ...merged, leadDays: leadDays.length > 0 ? leadDays : DEFAULT_PREFERENCES.leadDays };
}

export const preferencesService = {
  async get(userId: string): Promise<NotificationPreference> {
    return sanitize(await readJson<Partial<NotificationPreference>>(key(userId), {}));
  },
  async update(userId: string, changes: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const next = sanitize({ ...(await this.get(userId)), ...changes });
    await writeJson(key(userId), next);
    return next;
  },
};

const readKey = (userId: string) => storageKey('user', userId, 'inbox-read');

export const inboxStateService = {
  async readIds(userId: string): Promise<string[]> {
    return readJson<string[]>(readKey(userId), []);
  },
  async markRead(userId: string, ids: string[]): Promise<string[]> {
    const current = new Set(await this.readIds(userId));
    ids.forEach((id) => current.add(id));
    const next = [...current].slice(-500);
    await writeJson(readKey(userId), next);
    return next;
  },
};
