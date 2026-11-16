import { create } from 'zustand';

import type { PickedFile } from '@/features/documents/types';

interface ScanResultState {
  result: { requestId: string; file: PickedFile } | null;
  publish: (requestId: string, file: PickedFile) => void;
  consume: (requestId: string) => PickedFile | null;
}

export const useScanResultStore = create<ScanResultState>((set, get) => ({
  result: null,
  publish: (requestId, file) => set({ result: { requestId, file } }),
  consume: (requestId) => {
    const current = get().result;
    if (!current || current.requestId !== requestId) {
      return null;
    }
    set({ result: null });
    return current.file;
  },
}));
