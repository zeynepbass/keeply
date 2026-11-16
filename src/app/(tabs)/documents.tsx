import { FileText } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <Text accessibilityRole="header" className="px-5 pb-1 pt-7 font-display text-[21px]">
        {t.documents.title}
      </Text>
      <EmptyState className="flex-1" icon={FileText} title={t.documents.emptyTitle} description={t.documents.emptyDescription} />
    </View>
  );
}
