import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLogout } from '@/features/auth/hooks/use-auth-actions';
import { useCurrentUser } from '@/features/auth/stores/auth-store';
import { Button, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const logout = useLogout();
  return (
    <View className="flex-1 gap-4 bg-bg px-5" style={{ paddingTop: insets.top + 28 }}>
      <Text accessibilityRole="header" className="font-display text-[18px]">
        {user.name}
      </Text>
      <Text variant="secondary">{user.email}</Text>
      <Button label={t.profile.logout} variant="danger" block onPress={() => logout.mutate()} />
    </View>
  );
}
