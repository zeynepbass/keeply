import { Pressable, View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({ title, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <View className={cn('mb-3 flex-row items-center justify-between', className)}>
      <Text accessibilityRole="header" className="font-display text-[16px] text-text">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={10} onPress={onAction}>
          <Text className="font-semibold text-[12.5px] text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionLabel({ title, className }: { title: string; className?: string }) {
  return (
    <Text accessibilityRole="header" variant="overline" className={cn('mb-2.5 mt-4', className)}>
      {title}
    </Text>
  );
}
