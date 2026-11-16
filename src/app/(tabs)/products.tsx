import { router } from 'expo-router';
import { ChevronDown, LayoutGrid, List, PackageOpen, Plus, Search, SearchX, SlidersHorizontal } from 'lucide-react-native';
import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORY_OPTIONS } from '@/features/products/constants/categories';
import { ProductFilterSheet } from '@/features/products/components/product-filter-sheet';
import { ProductGridCard } from '@/features/products/components/product-grid-card';
import { ProductRow } from '@/features/products/components/product-row';
import { ProductSortSheet } from '@/features/products/components/product-sort-sheet';
import { useProducts } from '@/features/products/hooks/use-products';
import { countActiveFilters, DEFAULT_FILTERS, filterProducts } from '@/features/products/services/product-filters';
import { useProductListStore } from '@/features/products/stores/product-list-store';
import type { Product, ProductFilters } from '@/features/products/types';
import { WarrantyBadge } from '@/features/warranties/components/warranty-badge';
import { Chip, EmptyState, ErrorState, IconButton, LoadingState, Text, TextField } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatDate, today } from '@/shared/utils/date';

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const products = useProducts();
  const { viewMode, sort, setViewMode, setSort } = useProductListStore();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [filters, setFilters] = useState<Pick<ProductFilters, 'category' | 'warrantyStatus'>>({
    category: DEFAULT_FILTERS.category,
    warrantyStatus: DEFAULT_FILTERS.warrantyStatus,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const referenceDate = today();
  const activeFilters = { ...filters, query: deferredQuery, sort };
  const filtered = useMemo(
    () => filterProducts(products.data ?? [], { ...filters, query: deferredQuery, sort }, referenceDate),
    [products.data, filters, deferredQuery, sort, referenceDate],
  );
  const hasProducts = (products.data?.length ?? 0) > 0;
  const openProduct = (product: Product) => router.push({ pathname: '/products/[id]', params: { id: product.id } });
  const subtitleOf = (product: Product) => `${product.storeName} · ${formatDate(product.purchaseDate)}`;
  const filterCount = countActiveFilters(activeFilters);

  const header = (
    <View>
      <View className="flex-row items-center justify-between px-5 pb-1 pt-7">
        <Text accessibilityRole="header" className="font-display text-[21px]">
          {t.products.title}
        </Text>
        <View className="flex-row gap-2">
          <IconButton icon={SlidersHorizontal} label={t.products.filter} disabled={!hasProducts} badge={filterCount > 0} onPress={() => setFilterOpen(true)} />
          {hasProducts ? (
            <IconButton
              icon={viewMode === 'list' ? LayoutGrid : List}
              label={viewMode === 'list' ? t.products.gridView : t.products.listView}
              onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            />
          ) : null}
        </View>
      </View>
      <View className="px-5 pt-3">
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder={t.products.searchPlaceholder}
          accessibilityLabel={t.products.searchPlaceholder}
          editable={hasProducts}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          leading={<Search size={18} color={colors['text-secondary']} strokeWidth={2} />}
        />
      </View>
      {hasProducts ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 py-4">
            <Chip label={t.categories.all} selected={filters.category === 'all'} onPress={() => setFilters((value) => ({ ...value, category: 'all' }))} />
            {CATEGORY_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={filters.category === option.value}
                onPress={() => setFilters((value) => ({ ...value, category: option.value }))}
              />
            ))}
          </ScrollView>
          <View className="flex-row items-center justify-between px-5 pb-3">
            <Text className="font-body text-[13px] text-text-secondary">{t.products.count(filtered.length)}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`${t.products.sort.title}: ${t.products.sort[sort]}`} hitSlop={8} onPress={() => setSortOpen(true)} className="flex-row items-center gap-1">
              <Text className="font-semibold text-[13px] text-text-secondary">{t.products.sort[sort]}</Text>
              <ChevronDown size={14} color={colors['text-secondary']} strokeWidth={2.4} />
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );

  let body: React.ReactNode;
  if (products.isPending) {
    body = <LoadingState />;
  } else if (products.isError) {
    body = <ErrorState error={products.error} onRetry={() => products.refetch()} />;
  } else if (!hasProducts) {
    body = (
      <EmptyState
        className="flex-1"
        icon={PackageOpen}
        title={t.products.emptyTitle}
        description={t.products.emptyDescription}
        actionLabel={t.products.emptyAction}
        actionIcon={Plus}
        onAction={() => router.push('/products/new')}
      />
    );
  } else {
    body = (
      <FlatList
        key={viewMode}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperClassName={viewMode === 'grid' ? 'gap-2.5' : undefined}
        contentContainerClassName="gap-2.5 px-5 pb-6"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={products.isRefetching} onRefresh={() => void products.refetch()} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            compact
            className="pt-10"
            icon={SearchX}
            title={t.products.noResultsTitle}
            description={t.products.noResultsDescription}
            actionLabel={filterCount > 0 || query ? t.products.clearFilters : undefined}
            onAction={() => {
              setQuery('');
              setFilters({ category: 'all', warrantyStatus: 'all' });
            }}
          />
        }
        renderItem={({ item }) =>
          viewMode === 'grid' ? (
            <View className="flex-1" style={{ maxWidth: '50%' }}>
              <ProductGridCard product={item} subtitle={subtitleOf(item)} referenceDate={referenceDate} onPress={() => openProduct(item)} />
            </View>
          ) : (
            <ProductRow
              product={item}
              avatarSize={48}
              subtitle={subtitleOf(item)}
              trailing={<WarrantyBadge product={item} referenceDate={referenceDate} />}
              onPress={() => openProduct(item)}
            />
          )
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      {header}
      {body}
      <ProductFilterSheet
        key={`filter-${filterOpen}`}
        visible={filterOpen}
        filters={activeFilters}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFilterOpen(false);
        }}
      />
      <ProductSortSheet
        visible={sortOpen}
        value={sort}
        onClose={() => setSortOpen(false)}
        onSelect={(next) => {
          setSort(next);
          setSortOpen(false);
        }}
      />
    </View>
  );
}
