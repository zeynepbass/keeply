import { router } from 'expo-router';
import { Clock, Package, PackageOpen, Plus, ShieldCheck, Tag } from 'lucide-react-native';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityFeed } from '@/features/activity/components/activity-feed';
import { useActivities } from '@/features/activity/hooks/use-activities';
import { useCurrentUser } from '@/features/auth/stores/auth-store';
import { StatCard } from '@/features/dashboard/components/stat-card';
import { buildDashboardSummary } from '@/features/dashboard/services/dashboard-summary';
import { ProductRow } from '@/features/products/components/product-row';
import { useProducts } from '@/features/products/hooks/use-products';
import { WarrantyBadge } from '@/features/warranties/components/warranty-badge';
import { Badge, EmptyState, ErrorState, LoadingState, SectionHeader, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { formatDate, formatRelativeTime, getGreeting, today } from '@/shared/utils/date';
import { useTheme } from '@/shared/theme/theme-provider';

export default function HomeScreen() {
  const user = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const products = useProducts();
  const activities = useActivities();
  const referenceDate = today();
  const summary = useMemo(() => buildDashboardSummary(products.data ?? [], referenceDate), [products.data, referenceDate]);

  const header = (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-7">
      <View className="flex-1">
        <Text className="font-body text-[13px] text-text-secondary">{getGreeting()}</Text>
        <Text accessibilityRole="header" numberOfLines={1} className="font-display text-[21px] leading-[27px]">
          {user.name}
        </Text>
      </View>
    </View>
  );

  if (products.isPending) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        {header}
        <LoadingState />
      </View>
    );
  }

  if (products.isError) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        {header}
        <ErrorState error={products.error} onRetry={() => products.refetch()} />
      </View>
    );
  }

  if (summary.totalProducts === 0) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        {header}
        <EmptyState
          className="flex-1"
          icon={PackageOpen}
          title={t.dashboard.emptyTitle}
          description={t.dashboard.emptyDescription}
          actionLabel={t.dashboard.emptyAction}
          actionIcon={Plus}
          onAction={() => router.push('/products')}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={products.isRefetching}
          tintColor={colors.primary}
          onRefresh={() => {
            products.refetch();
            activities.refetch();
          }}
        />
      }
    >
      {header}
      <View className="gap-3 px-5 pt-1">
        <View className="flex-row gap-3">
          <StatCard icon={Package} iconColor="primary" value={summary.totalProducts} label={t.dashboard.stats.products} onPress={() => router.push('/products')} />
          <StatCard
            icon={ShieldCheck}
            iconColor="primary"
            value={summary.activeWarranties}
            label={t.dashboard.stats.activeWarranties}
            onPress={() => router.push({ pathname: '/warranties', params: { tab: 'active' } })}
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            icon={Clock}
            iconColor="warning-icon"
            value={summary.expiringWarranties}
            label={t.dashboard.stats.expiring}
            onPress={() => router.push({ pathname: '/warranties', params: { tab: 'expiring' } })}
          />
          <StatCard
            icon={Tag}
            iconColor="danger-icon"
            value={summary.upcomingReturns}
            label={t.dashboard.stats.returns}
            onPress={() => router.push('/returns')}
          />
        </View>
      </View>

      <View className="px-5 pt-6">
        <SectionHeader
          title={t.dashboard.expiringWarranties}
          actionLabel={t.common.seeAll}
          onAction={() => router.push({ pathname: '/warranties', params: { tab: 'expiring' } })}
        />
        {summary.expiring.length === 0 ? (
          <Text variant="secondary">{t.dashboard.noExpiring}</Text>
        ) : (
          <View className="gap-2.5">
            {summary.expiring.map(({ product, warranty }) => (
              <ProductRow
                key={product.id}
                product={product}
                subtitle={t.dashboard.warrantyEnds(formatDate(warranty.endDate))}
                trailing={<Badge label={t.common.days(warranty.remainingDays)} tone="warning" icon={Clock} />}
                onPress={() => router.push({ pathname: '/products/[id]', params: { id: product.id } })}
              />
            ))}
          </View>
        )}
      </View>

      {summary.returns.length > 0 ? (
        <View className="px-5 pt-6">
          <SectionHeader title={t.dashboard.upcomingReturns} actionLabel={t.common.seeAll} onAction={() => router.push('/returns')} />
          <View className="gap-2.5">
            {summary.returns.map(({ product, deadline }) => (
              <ProductRow
                key={product.id}
                product={product}
                subtitle={t.dashboard.returnEnds(formatDate(deadline.deadline))}
                trailing={
                  <Badge label={t.returns.remaining(deadline.remainingDays)} tone={deadline.status === 'urgent' ? 'danger' : 'warning'} icon={Tag} />
                }
                onPress={() => router.push({ pathname: '/products/[id]', params: { id: product.id } })}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View className="px-5 pt-6">
        <SectionHeader title={t.dashboard.recentProducts} actionLabel={t.common.seeAll} onAction={() => router.push('/products')} />
        <View className="gap-2.5">
          {summary.recentProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              subtitle={`${product.storeName} · ${formatRelativeTime(product.createdAt)}`}
              trailing={<WarrantyBadge product={product} referenceDate={referenceDate} />}
              onPress={() => router.push({ pathname: '/products/[id]', params: { id: product.id } })}
            />
          ))}
        </View>
      </View>

      <View className="px-5 pt-6">
        <Text accessibilityRole="header" className="mb-3 font-display text-[16px]">
          {t.dashboard.recentActivity}
        </Text>
        {activities.data && activities.data.length > 0 ? (
          <ActivityFeed activities={activities.data.slice(0, 5)} />
        ) : (
          <Text variant="secondary">{t.dashboard.noActivity}</Text>
        )}
      </View>
    </ScrollView>
  );
}
