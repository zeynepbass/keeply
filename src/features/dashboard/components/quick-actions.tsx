import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/components/ui';
import { elevatedShadow } from '@/shared/components/ui/card';
import { useTheme } from '@/shared/theme/theme-provider';

export interface QuickAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row justify-between">
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          className="w-[22%] items-center gap-2 active:opacity-70"
        >
          <View className="h-[52px] w-[52px] items-center justify-center rounded-md bg-surface" style={{ ...elevatedShadow, shadowOpacity: 0.06 }}>
            <action.icon size={22} color={colors.primary} strokeWidth={2} />
          </View>
          <Text numberOfLines={1} className="font-semibold text-[11.5px] text-text">
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
