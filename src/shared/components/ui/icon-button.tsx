import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: LucideIcon;
  label: string;
  tone?: 'default' | 'primary' | 'floating';
  badge?: boolean;
  className?: string;
}

export function IconButton({ icon: Icon, label, tone = 'default', badge = false, disabled, className, ...props }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={6}
      disabled={disabled}
      className={cn(
        'h-[38px] w-[38px] items-center justify-center rounded-full border active:opacity-70',
        tone === 'primary' ? 'border-primary bg-primary' : 'border-border bg-surface',
        tone === 'floating' && 'border-transparent',
        disabled && 'opacity-40',
        className,
      )}
      style={tone === 'floating' ? { backgroundColor: `${colors.surface}E6` } : undefined}
      {...props}
    >
      <Icon size={18} color={tone === 'primary' ? colors['on-primary'] : colors.text} strokeWidth={2.2} />
      {badge ? (
        <View className="absolute right-[5px] top-1 h-[9px] w-[9px] rounded-full border-[1.5px] border-surface bg-danger-icon" />
      ) : null}
    </Pressable>
  );
}
