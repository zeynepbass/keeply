import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

export interface ProgressBarProps {
  progress: number;
  tone?: 'primary' | 'warning' | 'danger';
  className?: string;
  accessibilityLabel?: string;
}

const FILL = {
  primary: 'bg-primary',
  warning: 'bg-warning-icon',
  danger: 'bg-danger-icon',
};

export function ProgressBar({ progress, tone = 'primary', className, accessibilityLabel }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      className={cn('h-1.5 flex-1 overflow-hidden rounded bg-border', className)}
    >
      <View className={cn('h-full rounded', FILL[tone])} style={{ width: `${clamped * 100}%` }} />
    </View>
  );
}
