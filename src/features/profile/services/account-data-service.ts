import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { activityService } from '@/features/activity/services/activity-service';
import { authService } from '@/features/auth/services/auth-service';
import type { User } from '@/features/auth/types';
import { documentService } from '@/features/documents/services/document-service';
import { notificationScheduler } from '@/features/notifications/services/notification-scheduler';
import { preferencesService } from '@/features/notifications/services/preferences-service';
import { reminderService } from '@/features/notifications/services/reminder-service';
import { productService } from '@/features/products/services/product-service';
import { serviceRecordService } from '@/features/service-history/services/service-record-service';
import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';
import { listKeys, removeKeys, storageKey } from '@/shared/lib/storage';
import { fileStorage } from '@/shared/services/file-storage';
import { today } from '@/shared/utils/date';

export async function buildExport(user: User) {
  const [products, documents, serviceRecords, reminders, activities, preferences] = await Promise.all([
    productService.list(user.id),
    documentService.list(user.id),
    serviceRecordService.list(user.id),
    reminderService.list(user.id),
    activityService.list(user.id),
    preferencesService.get(user.id),
  ]);
  return {
    app: 'Keeply',
    exportedAt: new Date().toISOString(),
    user: { name: user.name, email: user.email, createdAt: user.createdAt },
    products,
    documents: documents.map(({ uri: _uri, ...rest }) => rest),
    serviceRecords,
    reminders,
    activities,
    notificationPreferences: preferences,
  };
}

export const accountDataService = {
  async exportData(user: User): Promise<void> {
    const payload = await buildExport(user);
    try {
      const file = new File(Paths.cache, `keeply_verilerim_${today()}.json`);
      if (file.exists) {
        file.delete();
      }
      await file.write(JSON.stringify(payload, null, 2));
      if (!(await Sharing.isAvailableAsync())) {
        throw new AppError('file', t.documents.sharingUnavailable);
      }
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: t.profile.export.title });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('file', t.profile.export.failed);
    }
  },

  async clearData(userId: string): Promise<void> {
    await notificationScheduler.cancelAll();
    const keys = await listKeys(storageKey('user', userId));
    await removeKeys(keys);
    fileStorage.removeUserFiles(userId);
  },

  async deleteAccount(userId: string): Promise<void> {
    await this.clearData(userId);
    await authService.deleteAccount(userId);
  },
};
