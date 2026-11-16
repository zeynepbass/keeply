import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronRight, FileText } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ProductPickerSheet } from '@/features/documents/components/product-picker-sheet';
import { useCreateDocument } from '@/features/documents/hooks/use-documents';
import { isImageDocument, resolveMimeType, suggestDocumentName } from '@/features/documents/services/document-rules';
import { usePendingDocumentStore } from '@/features/documents/stores/pending-document-store';
import { DOCUMENT_TYPES, type DocumentType } from '@/features/documents/types';
import { ProductAvatar } from '@/features/products/components/product-avatar';
import { useProducts } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, Card, Chip, EmptyState, Text, TextField } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatFileSize } from '@/shared/utils/format';

function stripExtension(name: string): string {
  return name.replace(/\.[a-z0-9]{2,5}$/i, '');
}

export default function NewDocumentScreen() {
  const { colors } = useTheme();
  const { file, productId: initialProductId, clear } = usePendingDocumentStore();
  const products = useProducts();
  const createDocument = useCreateDocument();
  const [type, setType] = useState<DocumentType>('receipt');
  const [productId, setProductId] = useState<string | null>(initialProductId);
  const [name, setName] = useState(file ? stripExtension(file.name) : '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const product = products.data?.find((item) => item.id === productId) ?? null;

  if (!file) {
    return (
      <Screen header={<TopBar title={t.documents.form.title} backIcon="close" />}>
        <EmptyState className="flex-1" icon={FileText} title={t.documents.fileMissing} actionLabel={t.common.close} onAction={() => router.back()} />
      </Screen>
    );
  }

  const mimeType = resolveMimeType(file) ?? file.mimeType;

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t.validation.documentNameRequired);
      return;
    }
    createDocument.mutate(
      { input: { file, type, name: trimmed, productId }, subject: product ? getProductTitle(product) : trimmed },
      {
        onSuccess: () => {
          clear();
          toast.success(t.documents.saved);
          router.back();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <Screen
      scroll
      keyboard
      header={<TopBar title={t.documents.form.title} backIcon="close" onBack={() => { clear(); router.back(); }} />}
      contentClassName="gap-5 px-5 pb-6"
      footer={
        <View className="px-5 pt-3">
          <Button label={t.documents.form.save} block loading={createDocument.isPending} onPress={save} />
        </View>
      }
    >
      <Card className="overflow-hidden">
        {isImageDocument(mimeType) ? (
          <Image source={{ uri: file.uri }} style={{ width: '100%', height: 220 }} contentFit="cover" accessibilityLabel={file.name} />
        ) : (
          <View className="h-[120px] items-center justify-center gap-2 bg-danger-bg">
            <FileText size={36} color={colors['danger-icon']} strokeWidth={1.8} />
          </View>
        )}
        <View className="flex-row justify-between px-4 py-3">
          <Text numberOfLines={1} className="flex-1 font-semibold text-[13px]">
            {file.name}
          </Text>
          <Text variant="caption">{formatFileSize(file.size)}</Text>
        </View>
      </Card>
      <TextField
        label={t.documents.form.name}
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNameError(undefined);
        }}
        placeholder={suggestDocumentName('fis', product ? getProductTitle(product) : null)}
        error={nameError}
        autoCapitalize="none"
        maxLength={80}
      />
      <View>
        <Text variant="label" className="mb-1.5">
          {t.documents.form.type}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {DOCUMENT_TYPES.map((value) => (
            <Chip key={value} label={t.documents.types[value]} selected={type === value} onPress={() => setType(value)} />
          ))}
        </View>
      </View>
      <View>
        <Text variant="label" className="mb-1.5">
          {t.documents.form.product}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.documents.form.product}: ${product ? getProductTitle(product) : t.documents.form.noProduct}`}
          onPress={() => setPickerOpen(true)}
          className="h-[56px] flex-row items-center gap-3 rounded-xs border-[1.5px] border-border bg-surface px-3"
        >
          {product ? <ProductAvatar product={product} size={34} radius={10} /> : null}
          <Text numberOfLines={1} className={product ? 'flex-1 font-semibold text-[14px]' : 'flex-1 font-body text-[15px] text-placeholder'}>
            {product ? getProductTitle(product) : t.documents.form.noProduct}
          </Text>
          <ChevronRight size={18} color={colors['text-secondary']} strokeWidth={2} />
        </Pressable>
      </View>
      <ProductPickerSheet
        visible={pickerOpen}
        value={productId}
        onClose={() => setPickerOpen(false)}
        onSelect={(value) => {
          setProductId(value);
          setPickerOpen(false);
        }}
      />
    </Screen>
  );
}
