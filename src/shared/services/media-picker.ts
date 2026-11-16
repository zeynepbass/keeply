import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import type { PickedFile } from '@/features/documents/types';
import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';

function fromAsset(asset: ImagePicker.ImagePickerAsset, fallbackName: string): PickedFile {
  return {
    uri: asset.uri,
    name: asset.fileName ?? fallbackName,
    mimeType: asset.mimeType ?? 'image/jpeg',
    size: asset.fileSize ?? null,
  };
}

export const mediaPicker = {
  async pickImage(options: { allowsEditing?: boolean; aspect?: [number, number] } = {}): Promise<PickedFile | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: options.allowsEditing ?? false,
      aspect: options.aspect,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) {
      return null;
    }
    return fromAsset(result.assets[0], `gorsel_${Date.now()}.jpg`);
  },

  async takePhoto(options: { allowsEditing?: boolean; aspect?: [number, number] } = {}): Promise<PickedFile | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new AppError('permission_denied', t.scanner.permissionDenied);
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: options.allowsEditing ?? false,
        aspect: options.aspect,
        quality: 0.8,
      });
      if (result.canceled || result.assets.length === 0) {
        return null;
      }
      return fromAsset(result.assets[0], `fotograf_${Date.now()}.jpg`);
    } catch {
      throw new AppError('file', t.scanner.cameraUnavailable);
    }
  },

  async pickDocument(): Promise<PickedFile | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || result.assets.length === 0) {
        return null;
      }
      const asset = result.assets[0];
      return { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? '', size: asset.size ?? null };
    } catch {
      throw new AppError('file', t.documents.pickFailed);
    }
  },
};
