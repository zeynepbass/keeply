import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { PickedFile } from '@/features/documents/types';
import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';

export async function rotateImage(file: PickedFile, degrees: number): Promise<PickedFile> {
  try {
    const rendered = await ImageManipulator.manipulate(file.uri).rotate(degrees).renderAsync();
    const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
    return { ...file, uri: saved.uri, mimeType: 'image/jpeg', size: null };
  } catch {
    throw new AppError('file', t.scanner.captureFailed);
  }
}

export function receiptFileName(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `fis_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}.jpg`;
}
