import { receiptFileName } from './image-adjuster';
import { useScanResultStore } from '../stores/scan-result-store';

describe('receipt scanner helpers', () => {
  it('names captured receipts with a timestamp', () => {
    expect(receiptFileName(new Date(2026, 10, 16, 9, 5))).toBe('fis_20261116_0905.jpg');
  });

  it('hands a scan result only to the screen that requested it', () => {
    const file = { uri: 'file:///cache/fis.jpg', name: 'fis.jpg', mimeType: 'image/jpeg', size: null };
    useScanResultStore.getState().publish('istek-1', file);
    expect(useScanResultStore.getState().consume('istek-2')).toBeNull();
    expect(useScanResultStore.getState().consume('istek-1')).toEqual(file);
    expect(useScanResultStore.getState().consume('istek-1')).toBeNull();
  });
});
