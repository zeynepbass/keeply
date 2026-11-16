import { router, useLocalSearchParams } from 'expo-router';
import { Tag } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { ReturnCard } from '@/features/returns/components/return-card';
import { useReturnDeadlines, type ReturnGroups } from '@/features/returns/hooks/use-return-deadlines';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { EmptyState, ErrorState, LoadingState, SegmentedControl } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

type Tab = keyof ReturnGroups;

export default function ReturnsScreen() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'upcoming');
  const returns = useReturnDeadlines();

  return (
    <Screen header={<TopBar title={t.returns.title} />} edges={{ top: true, bottom: false }}>
      <View className="px-5 pb-4 pt-1">
        <SegmentedControl
          accessibilityLabel={t.returns.title}
          value={tab}
          onChange={setTab}
          options={(['upcoming', 'closed'] as const).map((value) => ({ value, label: t.returns.tabs[value] }))}
        />
      </View>
      {returns.isPending ? (
        <LoadingState />
      ) : returns.isError ? (
        <ErrorState error={returns.error} onRetry={() => returns.refetch()} />
      ) : (
        <FlatList
          data={returns.groups[tab]}
          keyExtractor={(item) => item.product.id}
          contentContainerClassName="gap-2.5 px-5 pb-10"
          refreshControl={<RefreshControl refreshing={returns.isRefetching} onRefresh={() => void returns.refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState compact className="pt-16" icon={Tag} title={tab === 'upcoming' ? t.returns.emptyUpcoming : t.returns.emptyClosed} />
          }
          renderItem={({ item }) => <ReturnCard item={item} onPress={() => router.push({ pathname: '/products/[id]', params: { id: item.product.id } })} />}
        />
      )}
    </Screen>
  );
}
