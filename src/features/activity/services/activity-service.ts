import { createId } from '@/shared/lib/id';
import { createCollection } from '@/shared/lib/storage';
import { t } from '@/shared/i18n';

import type { Activity, ActivityKind } from '../types';

const MAX_ACTIVITIES = 200;

export const activityRepository = createCollection<Activity>('activities', t.common.notFound);

export const activityService = {
  async list(userId: string): Promise<Activity[]> {
    const items = await activityRepository.list(userId);
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async log(userId: string, kind: ActivityKind, subject: string, productId: string | null): Promise<Activity> {
    const activity: Activity = { id: createId(), kind, subject, productId, createdAt: new Date().toISOString() };
    await activityRepository.insert(userId, activity);
    const items = await activityRepository.list(userId);
    if (items.length > MAX_ACTIVITIES) {
      const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      await activityRepository.replaceAll(userId, sorted.slice(0, MAX_ACTIVITIES));
    }
    return activity;
  },

  removeForProduct(userId: string, productId: string): Promise<Activity[]> {
    return activityRepository.removeWhere(userId, (activity) => activity.productId === productId);
  },
};
