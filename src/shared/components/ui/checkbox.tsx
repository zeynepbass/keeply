import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel: string;
  children?: ReactNode;
  error?: boolean;
}

export function Checkbox({ checked, onChange, accessibilityLabel, children, error = false }: CheckboxProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-start gap-2.5">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked }}
        hitSlop={10}
        onPress={() => onChange(!checked)}
        className={cn(
          'mt-px h-5 w-5 items-center justify-center rounded-[6px]',
          checked ? 'bg-primary' : cn('border-[1.5px]', error ? 'border-danger-icon' : 'border-border-strong'),
        )}
      >
        {checked ? <Check size={12} color={colors['on-primary']} strokeWidth={3} /> : null}
      </Pressable>
      <View className="flex-1">{children}</View>
    </View>
  );
}
