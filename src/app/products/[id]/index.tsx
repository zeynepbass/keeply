import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, CircleCheck, Clock, FileWarning, PencilLine, Store, Trash2, TriangleAlert } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActivities } from '@/features/activity/hooks/use-activities';
import { AttachDocumentSheet } from '@/features/documents/components/attach-document-sheet';
import { DocumentRow } from '@/features/documents/components/document-row';
import { useCreateDocument, useProductDocuments } from '@/features/documents/hooks/use-documents';
import { suggestDocumentName } from '@/features/documents/services/document-rules';
import { documentViewer } from '@/features/documents/services/document-viewer';
import type { PickedFile } from '@/features/documents/types';
import { ProductHero } from '@/features/products/components/product-hero';
import { buildProductTimeline, ProductTimeline } from '@/features/products/components/product-timeline';
import { useDeleteProduct, useProduct } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { getReturnDeadline } from '@/features/returns/services/return-calculator';
import { getWarranty } from '@/features/warranties/services/warranty-calculator';
import { toast } from '@/shared/components/feedback/toast-store';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Badge, Button, Card, DetailRow, ErrorState, LoadingState, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatDate, today } from '@/shared/utils/date';
import { formatCurrency, formatFileSize } from '@/shared/utils/format';
import { brandUpperCase } from '@/shared/utils/search';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const product = useProduct(id);
  const documents = useProductDocuments(id);
  const activities = useActivities();
  const deleteProduct = useDeleteProduct();
  const createDocument = useCreateDocument();
  const [attachOpen, setAttachOpen] = useState(false);
  const referenceDate = today();

  const timeline = useMemo(
    () =>
      product.data
        ? buildProductTimeline(
            (activities.data ?? []).filter((activity) => activity.productId === product.data.id),
            product.data.warrantyEndDate,
            referenceDate,
          )
        : [],
    [activities.data, product.data, referenceDate],
  );

  if (product.isPending) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <TopBar />
        <LoadingState />
      </View>
    );
  }
  if (product.isError || !product.data) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <TopBar />
        <ErrorState error={product.error} onRetry={() => product.refetch()} />
      </View>
    );
  }

  const item = product.data;
  const warranty = getWarranty(item, referenceDate);
  const returnInfo = getReturnDeadline(item, referenceDate);
  const productDocuments = documents.data ?? [];

  const confirmDelete = () =>
    Alert.alert(t.products.detail.deleteConfirmTitle, t.products.detail.deleteConfirmMessage(getProductTitle(item)), [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () =>
          deleteProduct.mutate(item.id, {
            onSuccess: () => {
              toast.success(t.products.detail.deleted);
              router.back();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          }),
      },
    ]);

  const attach = (file: PickedFile) =>
    createDocument.mutate(
      {
        input: { file, type: 'receipt', name: suggestDocumentName('fis', getProductTitle(item)), productId: item.id },
        subject: getProductTitle(item),
      },
      {
        onSuccess: () => toast.success(t.documents.saved),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );

  const edit = () => router.push({ pathname: '/products/[id]/edit', params: { id: item.id } });

  return (
    <View className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <ProductHero product={item} onEdit={edit} onDelete={confirmDelete} />
        <View className="p-5">
          <Text className="font-semibold text-[12.5px] text-text-secondary">{brandUpperCase(item.brand)}</Text>
          <Text accessibilityRole="header" className="mb-1.5 mt-1 font-display text-[21px] leading-[27px]">
            {item.name}
          </Text>
          {item.price !== null ? (
            <Text className="mb-4 font-display text-[20px] text-primary">{formatCurrency(item.price)}</Text>
          ) : (
            <View className="mb-4" />
          )}

          <View className="mb-5">
            {!warranty ? (
              <Badge label={t.warrantyStatus.noneLong} tone="neutral" />
            ) : warranty.status === 'expired' ? (
              <Badge label={t.warrantyStatus.expiredLong} tone="danger" icon={TriangleAlert} />
            ) : warranty.status === 'expiring' ? (
              <Badge label={t.products.detail.expiringWarranty(warranty.remainingDays)} tone="warning" icon={Clock} />
            ) : (
              <Badge label={t.products.detail.activeWarranty(warranty.remainingDays)} tone="success" icon={CircleCheck} />
            )}
          </View>

          <Card className="mb-5 overflow-hidden">
            <DetailRow label={t.products.detail.purchaseDate} value={formatDate(item.purchaseDate)} icon={<Calendar size={16} color={colors['text-secondary']} strokeWidth={2} />} />
            <DetailRow label={t.products.detail.store} value={item.storeName} icon={<Store size={16} color={colors['text-secondary']} strokeWidth={2} />} />
            <DetailRow label={t.products.detail.channel} value={t.products.detail.channels[item.salesChannel]} />
            {item.model ? <DetailRow label={t.products.detail.model} value={item.model} /> : null}
            {warranty ? (
              <>
                <DetailRow label={t.products.detail.warrantyDuration} value={t.products.detail.months(warranty.months)} />
                <DetailRow label={t.products.detail.warrantyStart} value={formatDate(warranty.startDate)} />
                <DetailRow
                  label={t.products.detail.warrantyEnd}
                  value={formatDate(warranty.endDate)}
                  valueClassName={warranty.status === 'expired' ? 'font-bold text-danger-text' : undefined}
                  divider={!!returnInfo}
                />
              </>
            ) : null}
            {returnInfo ? (
              <DetailRow
                label={t.products.detail.returnDeadline}
                divider={false}
                value={
                  <Badge
                    size="sm"
                    tone={returnInfo.status === 'closed' ? 'neutral' : returnInfo.status === 'urgent' ? 'danger' : 'warning'}
                    label={
                      returnInfo.status === 'closed'
                        ? t.products.detail.returnClosed(formatDate(returnInfo.deadline))
                        : t.products.detail.returnRemaining(formatDate(returnInfo.deadline), returnInfo.remainingDays)
                    }
                  />
                }
              />
            ) : null}
          </Card>

          {item.notes ? (
            <View className="mb-6">
              <Text accessibilityRole="header" className="mb-2 font-display text-[15px]">
                {t.products.detail.notes}
              </Text>
              <Card className="p-4">
                <Text className="font-body text-[13.5px] leading-[20px]">{item.notes}</Text>
              </Card>
            </View>
          ) : null}

          <View className="mb-3 flex-row items-center justify-between">
            <Text accessibilityRole="header" className="font-display text-[15px]">
              {t.products.detail.documents}
            </Text>
            {productDocuments.length > 0 ? (
              <Button label={t.common.addWithPlus} variant="secondary" size="sm" loading={createDocument.isPending} onPress={() => setAttachOpen(true)} />
            ) : null}
          </View>
          <View className="mb-6 gap-2.5">
            {productDocuments.length === 0 ? (
              <Card flat className="flex-row items-center gap-3 bg-warning-bg p-4">
                <View className="h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-surface">
                  <FileWarning size={18} color={colors['warning-icon']} strokeWidth={2} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-semibold text-[13.5px] text-warning-text">{t.products.detail.noReceiptTitle}</Text>
                  <Text variant="caption">{t.products.detail.noReceiptDescription}</Text>
                </View>
                <Button label={t.common.add} variant="secondary" size="sm" loading={createDocument.isPending} onPress={() => setAttachOpen(true)} />
              </Card>
            ) : (
              productDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  compact
                  document={document}
                  subtitle={`${formatFileSize(document.size)} · ${formatDate(document.createdAt.slice(0, 10))}`}
                  onPress={() => router.push({ pathname: '/documents/[id]', params: { id: document.id } })}
                  trailing={
                    <Pressable accessibilityRole="button" hitSlop={8} onPress={() => documentViewer.open(document).catch((error) => toast.error(getErrorMessage(error)))}>
                      <Text className="font-bold text-[12.5px] text-primary">{t.common.view}</Text>
                    </Pressable>
                  }
                />
              ))
            )}
          </View>

          {timeline.length > 0 ? (
            <View className="mb-6">
              <Text accessibilityRole="header" className="mb-3 font-display text-[15px]">
                {t.products.detail.history}
              </Text>
              <ProductTimeline entries={timeline} />
            </View>
          ) : null}

          <View className="flex-row gap-2.5">
            <Button label={t.common.edit} icon={PencilLine} variant="ghost" className="flex-1" onPress={edit} />
            <Button label={t.products.detail.deleteProduct} icon={Trash2} variant="danger" className="flex-1" loading={deleteProduct.isPending} onPress={confirmDelete} />
          </View>
        </View>
      </ScrollView>
      <AttachDocumentSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onPicked={attach}
        onCamera={() => router.push({ pathname: '/scanner', params: { mode: 'product', productId: item.id } })}
      />
    </View>
  );
}
