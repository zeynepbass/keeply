import { useMutation, useQuery } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/stores/auth-store';
import { documentService } from '@/features/documents/services/document-service';
import type { DocumentType, PickedFile } from '@/features/documents/types';
import { getErrorMessage } from '@/shared/lib/errors';
import { queryClient } from '@/shared/lib/query-client';
import { queryKeys } from '@/shared/lib/query-keys';

import { serviceRecordService } from '../services/service-record-service';
import type { ServiceRecord, ServiceRecordInput } from '../types';

function invalidate(userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceRecords.all(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.all(userId) }),
  ]);
}

export function useServiceRecords(productId: string | undefined) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.serviceRecords.all(userId),
    queryFn: () => serviceRecordService.list(userId),
    select: (records: ServiceRecord[]) => records.filter((record) => record.productId === productId),
  });
}

export interface SaveServiceRecordInput {
  recordId: string | null;
  input: ServiceRecordInput;
  productTitle: string;
  attachments: { file: PickedFile; type: DocumentType }[];
}

export function useSaveServiceRecord() {
  const userId = useUserId();
  return useMutation({
    mutationFn: async ({ recordId, input, productTitle, attachments }: SaveServiceRecordInput) => {
      const record = recordId
        ? await serviceRecordService.update(userId, recordId, input)
        : await serviceRecordService.create(userId, input, productTitle);
      const failures: string[] = [];
      for (const attachment of attachments) {
        try {
          await documentService.create(
            userId,
            {
              file: attachment.file,
              type: attachment.type,
              name: attachment.file.name.replace(/\.[a-z0-9]{2,5}$/i, ''),
              productId: input.productId,
              serviceRecordId: record.id,
            },
            productTitle,
          );
        } catch (error) {
          failures.push(getErrorMessage(error));
        }
      }
      return { record, failures };
    },
    onSuccess: () => invalidate(userId),
  });
}

export function useDeleteServiceRecord() {
  const userId = useUserId();
  return useMutation({
    mutationFn: (recordId: string) => serviceRecordService.remove(userId, recordId),
    onSuccess: () => invalidate(userId),
  });
}
