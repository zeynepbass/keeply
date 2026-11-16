import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

import { Text } from './text';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

const CONTAINER: Record<BadgeTone, string> = {
  success: 'bg-success-bg',
  warning: 'bg-warning-bg',
  danger: 'bg-danger-bg',
  neutral: 'bg-neutral-bg',
};

const LABEL: Record<BadgeTone, string> = {
  success: 'text-success-text',
  warning: 'text-warning-text',
  danger: 'text-danger-text',
  neutral: 'text-neutral-text',
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ label, tone = 'neutral', icon: Icon, size = 'md', className }: BadgeProps) {
  const { colors } = useTheme();
  const color = {
    success: colors['success-text'],
    warning: colors['warning-text'],
    danger: colors['danger-text'],
    neutral: colors['neutral-text'],
  }[tone];
  return (
    <View
      className={cn(
        'flex-row items-center self-start rounded-pill',
        size === 'md' ? 'gap-[5px] px-2.5 py-1' : 'gap-1 px-2 py-[3px]',
        CONTAINER[tone],
        className,
      )}
    >
      {Icon ? <Icon size={12} color={color} strokeWidth={2.4} /> : null}
      <Text className={cn('font-semibold', size === 'md' ? 'text-[12px]' : 'text-[10.5px]', LABEL[tone])} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
