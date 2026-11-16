import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

export interface ChipProps extends Omit<PressableProps, 'children'> {
  label: string;
  selected?: boolean;
  className?: string;
}

export function Chip({ label, selected = false, className, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={cn(
        'rounded-pill border-[1.5px] px-4 py-[9px] active:opacity-80',
        selected ? 'border-primary bg-primary' : 'border-border bg-surface',
        className,
      )}
      {...props}
    >
      <Text className={cn('font-semibold text-[13.5px]', selected ? 'text-on-primary' : 'text-text-secondary')} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
