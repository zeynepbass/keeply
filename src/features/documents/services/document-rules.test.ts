import type { Product } from '@/features/products/types';
import { t } from '@/shared/i18n';

import type { Document } from '../types';
import { filterDocuments } from './document-filters';
import { resolveMimeType, suggestDocumentName, validatePickedFile } from './document-rules';

const doc = (id: string, overrides: Partial<Document>): Document => ({
  id,
  productId: null,
  serviceRecordId: null,
  type: 'receipt',
  name: `${id}.pdf`,
  uri: `file:///docs/${id}.pdf`,
  mimeType: 'application/pdf',
  size: 1000,
  createdAt: '2026-11-01T10:00:00.000Z',
  ...overrides,
});

describe('document rules', () => {
  it('resolves mime types from the picker or file name', () => {
    expect(resolveMimeType({ mimeType: 'image/jpg', name: 'fis' })).toBe('image/jpeg');
    expect(resolveMimeType({ mimeType: '', name: 'fatura.PDF' })).toBe('application/pdf');
    expect(resolveMimeType({ mimeType: 'application/zip', name: 'arsiv.zip' })).toBeNull();
  });

  it('rejects unsupported and oversized files with Turkish messages', () => {
    expect(() => validatePickedFile({ uri: 'x', name: 'arsiv.zip', mimeType: 'application/zip', size: 10 })).toThrow(t.documents.unsupported);
    expect(() => validatePickedFile({ uri: 'x', name: 'buyuk.pdf', mimeType: 'application/pdf', size: 11 * 1024 * 1024 })).toThrow(
      t.documents.tooLarge,
    );
    expect(validatePickedFile({ uri: 'x', name: 'fis.png', mimeType: 'image/png', size: null })).toBe('image/png');
  });

  it('suggests ASCII file names from product titles', () => {
    expect(suggestDocumentName('fis', 'Philips Saç Kurutma Makinesi', new Date(2026, 10, 3))).toBe('fis_philips_sac_kurutma_makinesi_20261103');
    expect(suggestDocumentName('fatura', null, new Date(2026, 0, 9))).toBe('fatura_20260109');
  });

  it('filters documents by type and searches product names', () => {
    const products = [{ id: 'p1', brand: 'Samsung', name: 'Galaxy S24' } as Product];
    const documents = [doc('fatura_teknosa', { type: 'invoice', productId: 'p1' }), doc('fis_boyner', { type: 'receipt' })];
    expect(filterDocuments(documents, products, { query: 'galaxy', type: 'all' }).map((item) => item.id)).toEqual(['fatura_teknosa']);
    expect(filterDocuments(documents, products, { query: '', type: 'receipt' }).map((item) => item.id)).toEqual(['fis_boyner']);
    expect(filterDocuments(documents, products, { query: 'fatura', type: 'all' }).map((item) => item.id)).toEqual(['fatura_teknosa']);
  });
});
