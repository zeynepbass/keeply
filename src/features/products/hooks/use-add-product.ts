import { useMutation } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/stores/auth-store';
import { documentService } from '@/features/documents/services/document-service';
import { suggestDocumentName } from '@/features/documents/services/document-rules';
import { notificationScheduler } from '@/features/notifications/services/notification-scheduler';
import { preferencesService } from '@/features/notifications/services/preferences-service';
import type { ScheduleOutcome } from '@/features/notifications/types';
import { getErrorMessage } from '@/shared/lib/errors';
import { queryClient } from '@/shared/lib/query-client';
import { queryKeys } from '@/shared/lib/query-keys';

import type { PendingAttachment } from '../components/receipt-step';
import { toProductInput, type ProductFormValues } from '../schemas/product-schema';
import { getProductTitle } from '../services/product-display';
import { productService } from '../services/product-service';
import type { Product } from '../types';

export interface AddProductResult {
  product: Product;
  attachmentError: string | null;
  reminders: ScheduleOutcome;
}

export function useAddProduct() {
  const userId = useUserId();
  return useMutation({
    mutationFn: async ({ values, attachment }: { values: ProductFormValues; attachment: PendingAttachment | null }): Promise<AddProductResult> => {
      const product = await productService.create(userId, toProductInput(values));
      let attachmentError: string | null = null;
      if (attachment) {
        try {
          await documentService.create(
            userId,
            {
              file: attachment.file,
              type: attachment.type,
              name: suggestDocumentName(attachment.type === 'receipt' ? 'fis' : 'fatura', getProductTitle(product)),
              productId: product.id,
            },
            getProductTitle(product),
          );
        } catch (error) {
          attachmentError = getErrorMessage(error);
        }
      }
      const reminders = await notificationScheduler.syncProduct(userId, product, await preferencesService.get(userId), { prompt: true });
      return { product, attachmentError, reminders };
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all(userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.all(userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activities.all(userId) }),
      ]),
  });
}
