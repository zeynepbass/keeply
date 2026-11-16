import type { BottomTabBarProps } from 'expo-router/tabs';
import { FileText, House, Package, Plus, UserRound, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { elevatedShadow } from '@/shared/components/ui/card';
import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  home: { label: t.tabs.home, icon: House },
  products: { label: t.tabs.products, icon: Package },
  documents: { label: t.tabs.documents, icon: FileText },
  profile: { label: t.tabs.profile, icon: UserRound },
};

export const TAB_BAR_HEIGHT = 66;

export interface TabBarProps extends BottomTabBarProps {
  onAddPress?: () => void;
}

export function TabBar({ state, navigateToTab, onAddPress }: TabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((route) => route.name in TABS);

  const renderTab = (routeName: string) => {
    const route = state.routes.find((item) => item.name === routeName);
    if (!route) {
      return <View key={routeName} className="w-14" />;
    }
    const focused = state.routes[state.index]?.key === route.key;
    const { label, icon: Icon } = TABS[route.name];
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: focused }}
        onPress={() => {
          if (!focused) {
            navigateToTab(route.key);
          }
        }}
        className="w-16 items-center gap-1"
      >
        <Icon size={20} color={focused ? colors.primary : colors['text-secondary']} strokeWidth={2.2} />
        <Text numberOfLines={1} className={cn('font-semibold text-[11px]', focused ? 'text-primary' : 'text-text-secondary')}>
          {label}
        </Text>
      </Pressable>
    );
  };

  if (routes.length === 0) {
    return null;
  }

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row items-center justify-around border-t border-border bg-surface"
      style={{ height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }}
    >
      {renderTab('home')}
      {renderTab('products')}
      <View className="w-16 items-center">
        {onAddPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.tabs.addProduct}
          onPress={onAddPress}
          className="-mt-[30px] h-[54px] w-[54px] items-center justify-center rounded-full border-4 border-bg bg-primary active:opacity-90"
          style={elevatedShadow}
        >
          <Plus size={22} color={colors['on-primary']} strokeWidth={2.4} />
        </Pressable>
        ) : null}
      </View>
      {renderTab('documents')}
      {renderTab('profile')}
    </View>
  );
}
