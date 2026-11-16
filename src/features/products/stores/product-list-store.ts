import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storageKey } from '@/shared/lib/storage';

import type { ProductSort, ProductViewMode } from '../types';

interface ProductListState {
  viewMode: ProductViewMode;
  sort: ProductSort;
  setViewMode: (viewMode: ProductViewMode) => void;
  setSort: (sort: ProductSort) => void;
}

export const useProductListStore = create<ProductListState>()(
  persist(
    (set) => ({
      viewMode: 'list',
      sort: 'recent',
      setViewMode: (viewMode) => set({ viewMode }),
      setSort: (sort) => set({ sort }),
    }),
    {
      name: storageKey('product-list'),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
