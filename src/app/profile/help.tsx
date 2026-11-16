import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Card, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

export default function HelpScreen() {
  const { colors } = useTheme();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Screen scroll header={<TopBar title={t.profile.help.title} />} contentClassName="gap-2.5 px-5 pb-8 pt-2">
      {t.profile.help.faq.map((item, index) => {
        const expanded = open === index;
        const Icon = expanded ? ChevronUp : ChevronDown;
        return (
          <Card key={item.question} className="overflow-hidden">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : index)}
              className="flex-row items-center gap-3 px-4 py-4"
            >
              <Text className="flex-1 font-semibold text-[14px]">{item.question}</Text>
              <Icon size={18} color={colors['text-secondary']} strokeWidth={2} />
            </Pressable>
            {expanded ? (
              <View className="border-t border-border px-4 py-3.5">
                <Text className="font-body text-[13.5px] leading-[20px] text-text-secondary">{item.answer}</Text>
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
