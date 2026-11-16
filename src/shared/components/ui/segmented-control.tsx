import { Pressable, View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'md' | 'sm';
  className?: string;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row bg-neutral-bg', size === 'md' ? 'rounded-sm p-1' : 'gap-0.5 rounded-[10px] p-[3px]', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            className={cn(
              'items-center justify-center',
              size === 'md' ? 'flex-1 rounded-[10px] py-2.5' : 'rounded-xs px-2.5 py-[5px]',
              selected && 'bg-surface',
            )}
            style={selected ? { shadowColor: '#202923', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : undefined}
          >
            <Text
              numberOfLines={1}
              className={cn(
                size === 'md' ? 'text-[13.5px]' : 'text-[12px]',
                selected ? 'font-bold text-primary' : 'font-semibold text-text-secondary',
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
