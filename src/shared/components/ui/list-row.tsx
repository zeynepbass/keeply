import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

import { Text } from './text';

export interface ListRowProps {
  label: string;
  description?: string;
  value?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  divider?: boolean;
  destructive?: boolean;
  leading?: ReactNode;
}

export function ListRow({
  label,
  description,
  value,
  trailing,
  onPress,
  showChevron = !!onPress,
  divider = false,
  destructive = false,
  leading,
}: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <View className={cn('min-h-[52px] flex-row items-center gap-3 px-4 py-[15px]', divider && 'border-b border-border')}>
      {leading}
      <View className="flex-1">
        <Text className={cn('text-[14px]', description ? 'font-semibold' : 'font-body', destructive ? 'text-danger-text' : 'text-text')}>
          {label}
        </Text>
        {description ? <Text variant="caption" className="mt-0.5">{description}</Text> : null}
      </View>
      {value ? <Text className="font-body text-[13px] text-text-secondary">{value}</Text> : null}
      {trailing}
      {showChevron ? <ChevronRight size={18} color={colors['text-secondary']} strokeWidth={2} /> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={description} onPress={onPress} className="active:bg-neutral-bg">
      {content}
    </Pressable>
  );
}

export function DetailRow({ label, value, divider = true, valueClassName, icon }: { label: string; value: ReactNode; divider?: boolean; valueClassName?: string; icon?: ReactNode }) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3 px-4 py-3.5', divider && 'border-b border-border')}>
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="font-body text-[13.5px] text-text-secondary">{label}</Text>
      </View>
      {typeof value === 'string' ? (
        <Text className={cn('flex-shrink text-right font-semibold text-[13.5px] text-text', valueClassName)}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}
