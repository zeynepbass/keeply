import { ArrowLeft, X } from 'lucide-react-native';
import { View } from 'react-native';

import { IconButton, ProgressBar, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

export interface StepHeaderProps {
  step: number;
  total: number;
  onBack: () => void;
}

export function StepHeader({ step, total, onBack }: StepHeaderProps) {
  return (
    <View className="mb-5 flex-row items-center gap-3">
      <IconButton icon={step === 1 ? X : ArrowLeft} label={step === 1 ? t.common.close : t.common.back} onPress={onBack} />
      <View className="flex-1 flex-row items-center gap-2.5">
        <ProgressBar progress={step / total} accessibilityLabel={t.addProduct.step(step, total)} />
        <Text className="font-semibold text-[12px] text-text-secondary">{t.addProduct.step(step, total)}</Text>
      </View>
    </View>
  );
}

export function StepTitle({ title, description }: { title: string; description: string }) {
  return (
    <View className="mb-6">
      <Text accessibilityRole="header" className="mb-1.5 font-display text-[22px] leading-[28px]">
        {title}
      </Text>
      <Text className="font-body text-[14px] leading-[21px] text-text-secondary">{description}</Text>
    </View>
  );
}
