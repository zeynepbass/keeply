import { Camera, FolderOpen, Images, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { PickedFile } from '@/features/documents/types';
import { toast } from '@/shared/components/feedback/toast-store';
import { Sheet, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { mediaPicker } from '@/shared/services/media-picker';
import { useTheme } from '@/shared/theme/theme-provider';

export type AttachSource = 'camera' | 'files' | 'gallery';

export interface AttachDocumentSheetProps {
  visible: boolean;
  onClose: () => void;
  onPicked: (file: PickedFile) => void;
  onCamera?: () => void;
}

export function AttachDocumentSheet({ visible, onClose, onPicked, onCamera }: AttachDocumentSheetProps) {
  const { colors } = useTheme();

  const run = async (source: AttachSource) => {
    if (source === 'camera' && onCamera) {
      onClose();
      onCamera();
      return;
    }
    try {
      const file =
        source === 'files' ? await mediaPicker.pickDocument() : source === 'gallery' ? await mediaPicker.pickImage() : await mediaPicker.takePhoto();
      if (file) {
        onClose();
        onPicked(file);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const options: { source: AttachSource; icon: LucideIcon; title: string; description: string }[] = [
    { source: 'camera', icon: Camera, title: t.documents.sheet.camera, description: t.documents.sheet.cameraDescription },
    { source: 'files', icon: FolderOpen, title: t.documents.sheet.files, description: t.documents.sheet.filesDescription },
    { source: 'gallery', icon: Images, title: t.documents.sheet.gallery, description: t.documents.sheet.galleryDescription },
  ];

  return (
    <Sheet visible={visible} title={t.documents.sheet.title} onClose={onClose}>
      <View className="gap-2.5">
        {options.map((option) => (
          <Pressable
            key={option.source}
            accessibilityRole="button"
            accessibilityLabel={option.title}
            accessibilityHint={option.description}
            onPress={() => run(option.source)}
            className="flex-row items-center gap-3.5 rounded-lg border border-border bg-surface p-4 active:bg-neutral-bg"
          >
            <View className="h-[42px] w-[42px] items-center justify-center rounded-sm bg-primary-tint">
              <option.icon size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-[14.5px]">{option.title}</Text>
              <Text variant="caption">{option.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
