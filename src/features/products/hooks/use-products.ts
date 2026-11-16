import { useMutation, useQuery } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/stores/auth-store';
import { queryClient } from '@/shared/lib/query-client';
import { queryKeys } from '@/shared/lib/query-keys';

import { productService } from '../services/product-service';
import type { Product, ProductInput } from '../types';

export function invalidateProductData(userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.all(userId) }),
  ]);
}

export function useProducts() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.products.all(userId),
    queryFn: () => productService.list(userId),
  });
}

export function useProduct(productId: string | undefined) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.products.detail(userId, productId ?? ''),
    queryFn: () => productService.get(userId, productId ?? ''),
    enabled: !!productId,
    initialData: () =>
      queryClient.getQueryData<Product[]>(queryKeys.products.all(userId))?.find((product) => product.id === productId),
  });
}

export function useCreateProduct() {
  const userId = useUserId();
  return useMutation({
    mutationFn: (input: ProductInput) => productService.create(userId, input),
    onSuccess: () => invalidateProductData(userId),
  });
}

export function useUpdateProduct(productId: string) {
  const userId = useUserId();
  return useMutation({
    mutationFn: (input: ProductInput) => productService.update(userId, productId, input),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(userId, productId), product);
      return invalidateProductData(userId);
    },
  });
}

export function useDeleteProduct() {
  const userId = useUserId();
  return useMutation({
    mutationFn: (productId: string) => productService.remove(userId, productId),
    onSuccess: (_result, productId) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(userId, productId) });
      return queryClient.invalidateQueries({ predicate: (query) => query.queryKey[1] === userId });
    },
  });
}
