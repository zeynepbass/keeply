import { router } from 'expo-router';
import { ChevronRight, FileSearch, FileText, Search, Upload } from 'lucide-react-native';
import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttachDocumentSheet } from '@/features/documents/components/attach-document-sheet';
import { DocumentRow } from '@/features/documents/components/document-row';
import { useDocuments } from '@/features/documents/hooks/use-documents';
import { filterDocuments } from '@/features/documents/services/document-filters';
import { usePendingDocumentStore } from '@/features/documents/stores/pending-document-store';
import { DOCUMENT_TYPES, type DocumentType, type PickedFile } from '@/features/documents/types';
import { useProducts } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { Chip, EmptyState, ErrorState, IconButton, LoadingState, Text, TextField } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatDate, toIsoDate } from '@/shared/utils/date';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const documents = useDocuments();
  const products = useProducts();
  const setPending = usePendingDocumentStore((state) => state.set);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [type, setType] = useState<DocumentType | 'all'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasDocuments = (documents.data?.length ?? 0) > 0;
  const productTitles = useMemo(() => new Map((products.data ?? []).map((product) => [product.id, getProductTitle(product)])), [products.data]);
  const filtered = useMemo(
    () => filterDocuments(documents.data ?? [], products.data ?? [], { query: deferredQuery, type }),
    [documents.data, products.data, deferredQuery, type],
  );

  const startForm = (file: PickedFile) => {
    setPending(file);
    router.push('/documents/new');
  };

  const header = (
    <View>
      <View className="flex-row items-center justify-between px-5 pb-1 pt-7">
        <Text accessibilityRole="header" className="font-display text-[21px]">
          {t.documents.title}
        </Text>
        <IconButton icon={Upload} tone="primary" label={t.documents.upload} onPress={() => setSheetOpen(true)} />
      </View>
      {hasDocuments ? (
        <>
          <View className="px-5 pt-3">
            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder={t.documents.searchPlaceholder}
              accessibilityLabel={t.documents.searchPlaceholder}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
              leading={<Search size={18} color={colors['text-secondary']} strokeWidth={2} />}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 py-4">
            <Chip label={t.common.all} selected={type === 'all'} onPress={() => setType('all')} />
            {DOCUMENT_TYPES.map((value) => (
              <Chip key={value} label={t.documents.types[value]} selected={type === value} onPress={() => setType(value)} />
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  );

  let body: React.ReactNode;
  if (documents.isPending) {
    body = <LoadingState />;
  } else if (documents.isError) {
    body = <ErrorState error={documents.error} onRetry={() => documents.refetch()} />;
  } else if (!hasDocuments) {
    body = (
      <EmptyState
        className="flex-1"
        icon={FileText}
        title={t.documents.emptyTitle}
        description={t.documents.emptyDescription}
        actionLabel={t.documents.upload}
        actionIcon={Upload}
        onAction={() => setSheetOpen(true)}
      />
    );
  } else {
    body = (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-2.5 px-5 pb-6 pt-1"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={documents.isRefetching} onRefresh={() => void documents.refetch()} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState compact className="pt-10" icon={FileSearch} title={t.documents.noResults} />}
        renderItem={({ item }) => (
          <DocumentRow
            document={item}
            subtitle={`${item.productId ? (productTitles.get(item.productId) ?? t.documents.unlinked) : t.documents.unlinked} · ${formatDate(toIsoDate(new Date(item.createdAt)))}`}
            trailing={<ChevronRight size={18} color={colors['text-secondary']} strokeWidth={2} />}
            onPress={() => router.push({ pathname: '/documents/[id]', params: { id: item.id } })}
          />
        )}
      />
    );
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      {header}
      {body}
      <AttachDocumentSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPicked={startForm}
        onCamera={() => router.push({ pathname: '/scanner', params: { mode: 'library' } })}
      />
    </View>
  );
}
