import { activityService } from '@/features/activity/services/activity-service';
import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';
import { createId } from '@/shared/lib/id';
import { createCollection } from '@/shared/lib/storage';
import { extensionForMime, fileStorage } from '@/shared/services/file-storage';

import type { Document, DocumentInput } from '../types';
import { validatePickedFile } from './document-rules';

export const documentRepository = createCollection<Document>('documents', t.common.notFound);

export const documentService = {
  async list(userId: string): Promise<Document[]> {
    const items = await documentRepository.list(userId);
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async get(userId: string, documentId: string): Promise<Document> {
    const document = await documentRepository.get(userId, documentId);
    if (!document) {
      throw new AppError('not_found', t.common.notFound);
    }
    return document;
  },

  async create(userId: string, input: DocumentInput, activitySubject?: string): Promise<Document> {
    const mimeType = validatePickedFile(input.file);
    const id = createId();
    const extension = extensionForMime(mimeType, input.file.name);
    const stored = await fileStorage.persist(userId, 'documents', input.file.uri, `${id}.${extension}`);
    const name = input.name.trim() || input.file.name;
    const document: Document = {
      id,
      productId: input.productId,
      serviceRecordId: input.serviceRecordId ?? null,
      type: input.type,
      name: name.toLowerCase().endsWith(`.${extension}`) ? name : `${name}.${extension}`,
      uri: stored.uri,
      mimeType,
      size: stored.size || input.file.size || 0,
      createdAt: new Date().toISOString(),
    };
    try {
      await documentRepository.insert(userId, document);
    } catch (error) {
      fileStorage.remove(stored.uri);
      throw error;
    }
    await activityService.log(
      userId,
      document.type === 'receipt' ? 'receipt_added' : 'document_added',
      activitySubject ?? document.name,
      document.productId,
    );
    return document;
  },

  async update(userId: string, documentId: string, changes: Pick<Document, 'name' | 'type' | 'productId'>): Promise<Document> {
    return documentRepository.update(userId, documentId, changes);
  },

  async remove(userId: string, documentId: string): Promise<void> {
    const document = await this.get(userId, documentId);
    await documentRepository.remove(userId, documentId);
    fileStorage.remove(document.uri);
  },

  async removeWhere(userId: string, predicate: (document: Document) => boolean): Promise<void> {
    const removed = await documentRepository.removeWhere(userId, predicate);
    removed.forEach((document) => fileStorage.remove(document.uri));
  },
};
