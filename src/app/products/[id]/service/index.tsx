import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Wrench } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { useDocuments } from '@/features/documents/hooks/use-documents';
import { useProduct } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { ServiceRecordCard } from '@/features/service-history/components/service-record-card';
import { useServiceRecords } from '@/features/service-history/hooks/use-service-records';
import { totalServiceCost } from '@/features/service-history/services/service-record-service';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, Card, EmptyState, ErrorState, LoadingState, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { formatCurrency } from '@/shared/utils/format';

export default function ServiceHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);
  const records = useServiceRecords(id);
  const documents = useDocuments();
  const items = records.data ?? [];
  const openForm = (recordId?: string) =>
    router.push({ pathname: '/products/[id]/service/form', params: recordId ? { id, recordId } : { id } });

  return (
    <Screen
      header={<TopBar title={t.service.title} />}
      edges={{ top: true, bottom: true }}
      footer={
        items.length > 0 ? (
          <View className="px-5 pt-3">
            <Button label={t.service.newTitle} icon={Plus} block onPress={() => openForm()} />
          </View>
        ) : undefined
      }
    >
      {records.isPending ? (
        <LoadingState />
      ) : records.isError ? (
        <ErrorState error={records.error} onRetry={() => records.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          className="flex-1"
          icon={Wrench}
          title={t.service.empty}
          description={t.service.emptyDescription}
          actionLabel={t.service.newTitle}
          actionIcon={Plus}
          onAction={() => openForm()}
        />
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-6" showsVerticalScrollIndicator={false}>
          <Card flat className="mb-5 flex-row items-center justify-between bg-primary-tint px-4 py-3.5">
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="font-semibold text-[14px] text-primary-dark">
                {product.data ? getProductTitle(product.data) : ''}
              </Text>
              <Text className="font-body text-[12.5px] text-primary-dark">{t.service.count(items.length)}</Text>
            </View>
            <Text className="font-bold text-[13.5px] text-primary-dark">{t.service.totalCost(formatCurrency(totalServiceCost(items)))}</Text>
          </Card>
          {items.map((record, index) => (
            <ServiceRecordCard
              key={record.id}
              record={record}
              isLast={index === items.length - 1}
              documentCount={(documents.data ?? []).filter((document) => document.serviceRecordId === record.id).length}
              onPress={() => openForm(record.id)}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
