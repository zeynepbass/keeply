import { useQuery } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/stores/auth-store';
import { queryKeys } from '@/shared/lib/query-keys';

import { activityService } from '../services/activity-service';

export function useActivities() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.activities.all(userId),
    queryFn: () => activityService.list(userId),
  });
}
