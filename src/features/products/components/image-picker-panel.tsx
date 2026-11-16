import { Image } from 'expo-image';
import { Camera } from 'lucide-react-native';
import { View } from 'react-native';

import { toast } from '@/shared/components/feedback/toast-store';
import { Button, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { mediaPicker } from '@/shared/services/media-picker';
import { useTheme } from '@/shared/theme/theme-provider';

export interface ImagePickerPanelProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  compact?: boolean;
}

export function ImagePickerPanel({ value, onChange, compact = false }: ImagePickerPanelProps) {
  const { colors } = useTheme();

  const run = async (source: 'camera' | 'library') => {
    try {
      const file = source === 'camera' ? await mediaPicker.takePhoto({ allowsEditing: true, aspect: [4, 3] }) : await mediaPicker.pickImage({ allowsEditing: true, aspect: [4, 3] });
      if (file) {
        onChange(file.uri);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (value) {
    return (
      <View className={compact ? 'gap-3' : 'flex-1 gap-3'}>
        <View className="overflow-hidden rounded-md border-[1.5px] border-border" style={{ flex: compact ? undefined : 1, height: compact ? 200 : undefined }}>
          <Image source={{ uri: value }} style={{ flex: 1 }} contentFit="cover" accessibilityLabel={t.products.edit.image} />
        </View>
        <View className="flex-row gap-2.5">
          <Button label={t.addProduct.image.change} variant="secondary" size="sm" className="flex-1" onPress={() => run('library')} />
          <Button label={t.addProduct.image.remove} variant="danger" size="sm" className="flex-1" onPress={() => onChange(null)} />
        </View>
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center gap-3.5 rounded-md border-[1.5px] border-dashed border-border-strong bg-surface px-5"
      style={compact ? { paddingVertical: 28 } : { flex: 1 }}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
        <Camera size={28} color={colors.primary} strokeWidth={1.8} />
      </View>
      <Text className="max-w-[220px] text-center font-body text-[13.5px] text-text-secondary">{t.addProduct.image.hint}</Text>
      <View className="mt-1.5 flex-row gap-2.5">
        <Button label={t.addProduct.image.takePhoto} size="sm" onPress={() => run('camera')} />
        <Button label={t.addProduct.image.pickGallery} size="sm" variant="ghost" onPress={() => run('library')} />
      </View>
    </View>
  );
}
