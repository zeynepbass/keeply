import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Card, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

const DOCUMENTS = {
  terms: { title: t.legal.termsTitle, body: t.legal.termsBody },
  privacy: { title: t.legal.privacyTitle, body: t.legal.privacyBody },
} as const;

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = DOCUMENTS[doc === 'privacy' ? 'privacy' : 'terms'];
  return (
    <Screen scroll header={<TopBar title={content.title} />} contentClassName="px-5 pt-2">
      <Card className="gap-4 p-5">
        {content.body.map((paragraph, index) => (
          <View key={index} className="flex-row gap-2.5">
            <View className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            <Text className="flex-1 font-body text-[14px] leading-[21px] text-text">{paragraph}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
