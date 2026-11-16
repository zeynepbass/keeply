import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ExternalLink, FileText, Share2, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, View } from 'react-native';

import { useDeleteDocument, useDocuments } from '@/features/documents/hooks/use-documents';
import { isImageDocument } from '@/features/documents/services/document-rules';
import { documentViewer } from '@/features/documents/services/document-viewer';
import { useProducts } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, Card, DetailRow, EmptyState, IconButton, LoadingState, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatDate, toIsoDate } from '@/shared/utils/date';
import { formatFileSize } from '@/shared/utils/format';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const documents = useDocuments();
  const products = useProducts();
  const deleteDocument = useDeleteDocument();
  const document = documents.data?.find((item) => item.id === id);

  if (documents.isPending) {
    return (
      <Screen header={<TopBar />}>
        <LoadingState />
      </Screen>
    );
  }
  if (!document) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState className="flex-1" icon={FileText} title={t.common.notFound} />
      </Screen>
    );
  }

  const product = products.data?.find((item) => item.id === document.productId) ?? null;
  const open = () => documentViewer.open(document).catch((error) => toast.error(getErrorMessage(error)));
  const share = () => documentViewer.share(document).catch((error) => toast.error(getErrorMessage(error)));
  const remove = () =>
    Alert.alert(t.documents.detail.deleteTitle, t.documents.detail.deleteMessage(document.name), [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () =>
          deleteDocument.mutate(document.id, {
            onSuccess: () => {
              toast.success(t.documents.detail.deleted);
              router.back();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          }),
      },
    ]);

  return (
    <Screen
      scroll
      header={<TopBar title={t.documents.types[document.type]} right={<IconButton icon={Trash2} label={t.common.delete} onPress={remove} />} />}
      contentClassName="gap-5 px-5 pb-6"
    >
      <Pressable accessibilityRole="button" accessibilityLabel={t.documents.detail.open} onPress={open}>
        <Card className="overflow-hidden">
          {isImageDocument(document.mimeType) ? (
            <Image source={{ uri: document.uri }} style={{ width: '100%', height: 320 }} contentFit="contain" accessibilityLabel={document.name} />
          ) : (
            <View className="h-[200px] items-center justify-center gap-3 bg-danger-bg px-8">
              <FileText size={48} color={colors['danger-icon']} strokeWidth={1.6} />
              <Text className="text-center font-body text-[12.5px] text-danger-text">{t.documents.detail.pdfPreview}</Text>
            </View>
          )}
        </Card>
      </Pressable>
      <View>
        <Text accessibilityRole="header" className="mb-3 font-display text-[18px]">
          {document.name}
        </Text>
        <Card className="overflow-hidden">
          <DetailRow label={t.documents.detail.type} value={t.documents.types[document.type]} />
          <DetailRow
            label={t.documents.detail.product}
            value={
              product ? (
                <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/products/[id]', params: { id: product.id } })}>
                  <Text className="font-semibold text-[13.5px] text-primary">{getProductTitle(product)}</Text>
                </Pressable>
              ) : (
                t.documents.unlinked
              )
            }
          />
          <DetailRow label={t.documents.detail.size} value={formatFileSize(document.size)} />
          <DetailRow label={t.documents.detail.added} value={formatDate(toIsoDate(new Date(document.createdAt)))} divider={false} />
        </Card>
      </View>
      <View className="flex-row gap-2.5">
        <Button label={t.documents.detail.open} icon={ExternalLink} className="flex-1" onPress={open} />
        <Button label={t.documents.detail.share} icon={Share2} variant="ghost" className="flex-1" onPress={share} />
      </View>
    </Screen>
  );
}
