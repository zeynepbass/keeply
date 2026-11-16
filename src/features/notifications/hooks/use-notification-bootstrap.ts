import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth/stores/auth-store';
import { productService } from '@/features/products/services/product-service';

import { configureNotifications, notificationScheduler } from '../services/notification-scheduler';
import { preferencesService } from '../services/preferences-service';

let handledResponseId: string | null = null;

function openFromResponse(response: Notifications.NotificationResponse | null) {
  if (!response || response.notification.request.identifier === handledResponseId) {
    return;
  }
  handledResponseId = response.notification.request.identifier;
  const productId = response.notification.request.content.data?.productId;
  if (typeof productId === 'string' && productId.length > 0) {
    router.push({ pathname: '/products/[id]', params: { id: productId } });
  } else {
    router.push('/notifications');
  }
}

export function useNotificationBootstrap(): void {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    void configureNotifications();
  }, []);

  useEffect(() => {
    if (!userId) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === userId) {
      return;
    }
    syncedFor.current = userId;
    void (async () => {
      const [products, preferences] = await Promise.all([productService.list(userId), preferencesService.get(userId)]);
      await notificationScheduler.syncAll(userId, products, preferences);
    })();
    openFromResponse(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(openFromResponse);
    return () => subscription.remove();
  }, [userId]);
}
