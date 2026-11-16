import { Directory, File, Paths } from 'expo-file-system';

import { AppError } from '@/shared/lib/errors';

export type StorageFolder = 'documents' | 'images';

const ROOT = 'keeply';

const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/webp': 'webp',
};

export function extensionForMime(mimeType: string, fallbackName = ''): string {
  const known = EXTENSIONS[mimeType.toLowerCase()];
  if (known) {
    return known;
  }
  const match = /\.([a-z0-9]{2,5})$/i.exec(fallbackName);
  return match ? match[1].toLowerCase() : 'bin';
}

export function mimeFromName(name: string): string | null {
  const extension = /\.([a-z0-9]{2,5})$/i.exec(name)?.[1]?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'heic':
      return 'image/heic';
    default:
      return null;
  }
}

function folderFor(userId: string, folder: StorageFolder): Directory {
  const directory = new Directory(Paths.document, ROOT, userId, folder);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

export const fileStorage = {
  async persist(userId: string, folder: StorageFolder, sourceUri: string, fileName: string): Promise<{ uri: string; size: number }> {
    try {
      const source = new File(sourceUri);
      if (!source.exists) {
        throw new AppError('file', 'Seçilen dosya bulunamadı.');
      }
      const destination = new File(folderFor(userId, folder), fileName);
      if (destination.exists) {
        destination.delete();
      }
      await source.copy(destination);
      return { uri: destination.uri, size: destination.size ?? source.size ?? 0 };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('file', 'Dosya kaydedilemedi. Cihazında yeterli alan olduğundan emin ol.');
    }
  },

  async writeText(userId: string, folder: StorageFolder, fileName: string, content: string): Promise<{ uri: string; size: number }> {
    const destination = new File(folderFor(userId, folder), fileName);
    if (destination.exists) {
      destination.delete();
    }
    await destination.write(content);
    return { uri: destination.uri, size: destination.size ?? content.length };
  },

  isManaged(uri: string | null | undefined): boolean {
    return !!uri && uri.includes(`/${ROOT}/`);
  },

  remove(uri: string | null | undefined): void {
    if (!uri || !this.isManaged(uri)) {
      return;
    }
    try {
      const file = new File(uri);
      if (file.exists) {
        file.delete();
      }
    } catch {
      return;
    }
  },

  exists(uri: string): boolean {
    try {
      return new File(uri).exists;
    } catch {
      return false;
    }
  },

  removeUserFiles(userId: string): void {
    try {
      const directory = new Directory(Paths.document, ROOT, userId);
      if (directory.exists) {
        directory.delete();
      }
    } catch {
      return;
    }
  },
};
