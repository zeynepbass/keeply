import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';
import { mimeFromName } from '@/shared/services/file-storage';

import type { PickedFile } from '../types';

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'];

export function resolveMimeType(file: Pick<PickedFile, 'mimeType' | 'name'>): string | null {
  const fromPicker = file.mimeType?.toLowerCase();
  if (fromPicker && SUPPORTED_DOCUMENT_TYPES.includes(fromPicker === 'image/jpg' ? 'image/jpeg' : fromPicker)) {
    return fromPicker === 'image/jpg' ? 'image/jpeg' : fromPicker;
  }
  return mimeFromName(file.name);
}

export function validatePickedFile(file: PickedFile): string {
  const mimeType = resolveMimeType(file);
  if (!mimeType || !SUPPORTED_DOCUMENT_TYPES.includes(mimeType)) {
    throw new AppError('validation', t.documents.unsupported);
  }
  if (file.size !== null && file.size > MAX_DOCUMENT_BYTES) {
    throw new AppError('validation', t.documents.tooLarge);
  }
  return mimeType;
}

export function isImageDocument(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function suggestDocumentName(type: string, productTitle: string | null, date: Date = new Date()): string {
  const slug = (productTitle ?? '')
    .toLowerCase()
    .replace(/[çğıöşü]/g, (char) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[char] ?? char)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return [type, slug || null, stamp].filter(Boolean).join('_');
}
