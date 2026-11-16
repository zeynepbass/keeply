import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';

import type { Document } from '../types';

export const documentViewer = {
  async open(document: Pick<Document, 'uri' | 'mimeType' | 'name'>): Promise<void> {
    const file = new File(document.uri);
    if (!file.exists) {
      throw new AppError('file', t.documents.fileMissing);
    }
    try {
      if (await File.canPreview(file)) {
        await File.preview(file);
        return;
      }
    } catch {
      return this.share(document);
    }
    return this.share(document);
  },

  async share(document: Pick<Document, 'uri' | 'mimeType' | 'name'>): Promise<void> {
    if (!(await Sharing.isAvailableAsync())) {
      throw new AppError('file', t.documents.sharingUnavailable);
    }
    await Sharing.shareAsync(document.uri, { mimeType: document.mimeType, dialogTitle: document.name });
  },
};
