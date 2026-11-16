import { router, useLocalSearchParams } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { WarrantyCard } from '@/features/warranties/components/warranty-card';
import { useWarranties, type WarrantyGroups } from '@/features/warranties/hooks/use-warranties';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { EmptyState, ErrorState, LoadingState, SegmentedControl } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

type Tab = keyof WarrantyGroups;

const EMPTY: Record<Tab, string> = {
  active: t.warranties.emptyActive,
  expiring: t.warranties.emptyExpiring,
  expired: t.warranties.emptyExpired,
};

export default function WarrantiesScreen() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'expiring');
  const warranties = useWarranties();
  const items = warranties.groups[tab];

  return (
    <Screen header={<TopBar title={t.warranties.title} />} edges={{ top: true, bottom: false }}>
      <View className="px-5 pb-4 pt-1">
        <SegmentedControl
          accessibilityLabel={t.warranties.title}
          value={tab}
          onChange={setTab}
          options={(['active', 'expiring', 'expired'] as const).map((value) => ({ value, label: t.warranties.tabs[value] }))}
        />
      </View>
      {warranties.isPending ? (
        <LoadingState />
      ) : warranties.isError ? (
        <ErrorState error={warranties.error} onRetry={() => warranties.refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.product.id}
          contentContainerClassName="gap-2.5 px-5 pb-10"
          refreshControl={<RefreshControl refreshing={warranties.isRefetching} onRefresh={() => void warranties.refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState compact className="pt-16" icon={ShieldCheck} title={EMPTY[tab]} />}
          renderItem={({ item }) => <WarrantyCard item={item} onPress={() => router.push({ pathname: '/products/[id]', params: { id: item.product.id } })} />}
        />
      )}
    </Screen>
  );
}
