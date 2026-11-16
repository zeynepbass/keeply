import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-primary-tint',
  ghost: 'border-[1.5px] border-border-strong bg-transparent',
  danger: 'border-[1.5px] border-danger-bg bg-transparent',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-primary',
  ghost: 'text-text',
  danger: 'text-danger-text',
};

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  block?: boolean;
  className?: string;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  block = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const iconColor = {
    primary: colors['on-primary'],
    secondary: colors.primary,
    ghost: colors.text,
    danger: colors['danger-text'],
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 active:opacity-80',
        size === 'md' ? 'h-[52px] rounded-sm px-5' : 'h-10 rounded-xs px-3.5',
        isDisabled ? 'bg-neutral-bg' : CONTAINER[variant],
        isDisabled && variant !== 'primary' && variant !== 'secondary' ? 'border-0' : '',
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors['text-secondary']} />
      ) : Icon ? (
        <Icon size={size === 'md' ? 18 : 16} color={isDisabled ? colors['text-secondary'] : iconColor} strokeWidth={2.2} />
      ) : null}
      <Text
        numberOfLines={1}
        className={cn(
          'font-semibold',
          size === 'md' ? 'text-[15px]' : 'text-[13px]',
          isDisabled ? 'text-text-secondary' : LABEL[variant],
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
