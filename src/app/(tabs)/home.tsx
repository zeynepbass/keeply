import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useLogout } from '@/features/auth/hooks/use-auth-actions';
import { Screen } from '@/shared/components/layout/screen';
import { Button, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getGreeting } from '@/shared/utils/date';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  return (
    <Screen contentClassName="gap-4 p-5">
      <Text variant="secondary">{getGreeting()}</Text>
      <Text variant="h2">{user?.name}</Text>
      <Button label={t.profile.logout} variant="danger" onPress={() => logout.mutate()} />
    </Screen>
  );
}
