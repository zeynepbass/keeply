import { FileText, ImageIcon, ScanLine, Upload, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { DocumentType, PickedFile } from '@/features/documents/types';
import { validatePickedFile } from '@/features/documents/services/document-rules';
import { toast } from '@/shared/components/feedback/toast-store';
import { Badge, Button, Card, Chip, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { mediaPicker } from '@/shared/services/media-picker';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatFileSize } from '@/shared/utils/format';

export interface PendingAttachment {
  file: PickedFile;
  type: Extract<DocumentType, 'receipt' | 'invoice'>;
}

export interface ReceiptStepProps {
  value: PendingAttachment | null;
  onChange: (value: PendingAttachment | null) => void;
  onScan: () => void;
}

export function ReceiptStep({ value, onChange, onScan }: ReceiptStepProps) {
  const { colors } = useTheme();

  const accept = (file: PickedFile | null) => {
    if (!file) {
      return;
    }
    try {
      validatePickedFile(file);
      onChange({ file, type: value?.type ?? 'receipt' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const pickFile = async () => {
    try {
      accept(await mediaPicker.pickDocument());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <View className="gap-4">
      {value ? (
        <Card className="gap-3.5 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-danger-bg">
              {value.file.mimeType.startsWith('image/') ? (
                <ImageIcon size={18} color={colors['danger-icon']} strokeWidth={2} />
              ) : (
                <FileText size={18} color={colors['danger-icon']} strokeWidth={2} />
              )}
            </View>
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="font-semibold text-[13.5px]">
                {value.file.name}
              </Text>
              <Text variant="caption">{formatFileSize(value.file.size)}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t.addProduct.receipt.remove} hitSlop={10} onPress={() => onChange(null)}>
              <X size={18} color={colors['text-secondary']} strokeWidth={2.2} />
            </Pressable>
          </View>
          <View>
            <Text variant="label" className="mb-1.5">
              {t.addProduct.receipt.typeLabel}
            </Text>
            <View className="flex-row gap-2">
              <Chip label={t.documents.types.receipt} selected={value.type === 'receipt'} onPress={() => onChange({ ...value, type: 'receipt' })} />
              <Chip label={t.documents.types.invoice} selected={value.type === 'invoice'} onPress={() => onChange({ ...value, type: 'invoice' })} />
            </View>
          </View>
        </Card>
      ) : (
        <View className="items-center gap-3 rounded-md border-[1.5px] border-dashed border-border-strong bg-surface px-5 py-7">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-tint">
            <Upload size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <Text className="text-center font-body text-[13.5px] text-text-secondary">{t.addProduct.receipt.formats}</Text>
          <View className="flex-row gap-2.5">
            <Button label={t.addProduct.receipt.upload} size="sm" onPress={pickFile} />
            <Button label={t.addProduct.receipt.takePhoto} size="sm" variant="ghost" onPress={onScan} />
          </View>
        </View>
      )}
      <Card flat className="flex-row items-center gap-3 border-[1.5px] border-dashed border-border p-4 opacity-85">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-bg">
          <ScanLine size={18} color={colors['text-secondary']} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="font-semibold text-[13.5px]">{t.addProduct.receipt.scanTitle}</Text>
            <Badge label={t.common.comingSoon} size="sm" />
          </View>
          <Text variant="caption" className="mt-0.5">
            {t.addProduct.receipt.scanDescription}
          </Text>
        </View>
      </Card>
    </View>
  );
}
