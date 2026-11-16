import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

import { Button } from './button';
import { Text } from './text';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  compact = false,
  className,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const circle = compact ? 68 : 92;
  return (
    <View className={cn('items-center justify-center gap-[18px] px-10', className)}>
      <View
        className="items-center justify-center rounded-full bg-primary-tint"
        style={{ width: circle, height: circle }}
      >
        <Icon size={compact ? 30 : 40} color={colors.primary} strokeWidth={1.8} />
      </View>
      <View className="items-center">
        <Text className={cn('mb-2 text-center font-display', compact ? 'text-[15px]' : 'text-[19px]')}>{title}</Text>
        {description ? (
          <Text className="text-center font-body text-[14px] leading-[21px] text-text-secondary">{description}</Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} icon={actionIcon} onPress={onAction} size={compact ? 'sm' : 'md'} className="px-7" />
      ) : null}
    </View>
  );
}
