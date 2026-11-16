import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

import { cn } from '@/shared/lib/cn';

const SHADOW = {
  shadowColor: '#202923',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
};

export interface CardProps extends ViewProps {
  className?: string;
  flat?: boolean;
}

export function Card({ className, flat = false, style, ...props }: CardProps) {
  return <View className={cn('rounded-lg bg-surface', className)} style={[flat ? null : SHADOW, style]} {...props} />;
}

export interface PressableCardProps extends PressableProps {
  className?: string;
}

export function PressableCard({ className, ...props }: PressableCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn('rounded-lg bg-surface active:opacity-80', className)}
      style={SHADOW}
      {...props}
    />
  );
}

export const elevatedShadow = {
  shadowColor: '#176B50',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 28,
  elevation: 6,
};
