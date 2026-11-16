import { useMutation, useQuery } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/stores/auth-store';
import { queryClient } from '@/shared/lib/query-client';
import { queryKeys } from '@/shared/lib/query-keys';

import { documentService } from '../services/document-service';
import type { Document, DocumentInput } from '../types';

function invalidateDocuments(userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.all(userId) }),
  ]);
}

export function useDocuments<T = Document[]>(select?: (documents: Document[]) => T) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.documents.all(userId),
    queryFn: () => documentService.list(userId),
    select,
  });
}

export function useProductDocuments(productId: string | undefined) {
  return useDocuments((documents) => documents.filter((document) => document.productId === productId && !document.serviceRecordId));
}

export function useCreateDocument() {
  const userId = useUserId();
  return useMutation({
    mutationFn: ({ input, subject }: { input: DocumentInput; subject?: string }) => documentService.create(userId, input, subject),
    onSuccess: () => invalidateDocuments(userId),
  });
}

export function useDeleteDocument() {
  const userId = useUserId();
  return useMutation({
    mutationFn: (documentId: string) => documentService.remove(userId, documentId),
    onSuccess: () => invalidateDocuments(userId),
  });
}
