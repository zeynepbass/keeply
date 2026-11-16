import { create } from 'zustand';

import type { PickedFile } from '../types';

interface PendingDocumentState {
  file: PickedFile | null;
  productId: string | null;
  set: (file: PickedFile, productId?: string | null) => void;
  clear: () => void;
}

export const usePendingDocumentStore = create<PendingDocumentState>((set) => ({
  file: null,
  productId: null,
  set: (file, productId = null) => set({ file, productId }),
  clear: () => set({ file: null, productId: null }),
}));
