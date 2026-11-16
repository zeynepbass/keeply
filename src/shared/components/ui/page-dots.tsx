import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

export function PageDots({ count, active }: { count: number; active: number }) {
  return (
    <View className="flex-row justify-center gap-1.5" importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          className={cn('h-[7px] rounded', index === active ? 'w-5 bg-primary' : 'w-[7px] bg-border-strong')}
        />
      ))}
    </View>
  );
}
