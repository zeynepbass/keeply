import { Check } from 'lucide-react-native';

import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Card, ListRow, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

export default function LanguageScreen() {
  const { colors } = useTheme();
  return (
    <Screen header={<TopBar title={t.profile.languageScreen.title} />} contentClassName="gap-3 px-5 pt-2">
      <Card className="overflow-hidden" accessibilityRole="radiogroup">
        <ListRow label={t.profile.turkish} trailing={<Check size={18} color={colors.primary} strokeWidth={2.4} />} />
      </Card>
      <Text variant="secondary">{t.profile.languageScreen.description}</Text>
    </Screen>
  );
}
