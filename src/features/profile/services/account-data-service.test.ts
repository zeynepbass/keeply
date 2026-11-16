import AsyncStorage from '@react-native-async-storage/async-storage';

import { authService } from '@/features/auth/services/auth-service';
import { documentRepository } from '@/features/documents/services/document-service';
import { productService } from '@/features/products/services/product-service';

import { accountDataService, buildExport } from './account-data-service';

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Directory: jest.fn().mockImplementation(() => ({ exists: false })),
  Paths: { document: 'file:///belgeler', cache: 'file:///onbellek' },
}));

describe('account data service', () => {
  beforeEach(() => AsyncStorage.clear());

  it('exports user data without device file paths', async () => {
    const user = await authService.register({ name: 'Elif Yılmaz', email: 'elif@posta.com', password: 'guvenli123' });
    const product = await productService.create(user.id, {
      name: 'Galaxy S24',
      brand: 'Samsung',
      model: null,
      category: 'electronics',
      imageUri: null,
      price: 42999,
      purchaseDate: '2026-10-12',
      storeName: 'Teknosa',
      salesChannel: 'online',
      hasWarranty: true,
      warrantyMonths: 24,
      warrantyStartDate: '2026-10-12',
      returnDeadline: null,
      notes: null,
    });
    await documentRepository.insert(user.id, {
      id: 'd1',
      productId: product.id,
      serviceRecordId: null,
      type: 'invoice',
      name: 'fatura.pdf',
      uri: 'file:///gizli/yol/fatura.pdf',
      mimeType: 'application/pdf',
      size: 10,
      createdAt: '2026-10-12T10:00:00.000Z',
    });
    const payload = await buildExport(user);
    expect(payload.user).toEqual({ name: 'Elif Yılmaz', email: 'elif@posta.com', createdAt: user.createdAt });
    expect(payload.products).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain('file:///gizli');
    expect(JSON.stringify(payload)).not.toContain('passwordHash');
  });

  it('clears all user records but keeps other users and the account', async () => {
    const first = await authService.register({ name: 'Elif Yılmaz', email: 'elif@posta.com', password: 'guvenli123' });
    const second = await authService.register({ name: 'Can Demir', email: 'can@posta.com', password: 'guvenli123' });
    const input = {
      name: 'Masa',
      brand: 'IKEA',
      model: null,
      category: 'furniture' as const,
      imageUri: null,
      price: null,
      purchaseDate: '2026-10-12',
      storeName: 'IKEA',
      salesChannel: 'in_store' as const,
      hasWarranty: false,
      warrantyMonths: null,
      warrantyStartDate: null,
      returnDeadline: null,
      notes: null,
    };
    await productService.create(first.id, input);
    await productService.create(second.id, input);
    await accountDataService.clearData(first.id);
    expect(await productService.list(first.id)).toEqual([]);
    expect(await productService.list(second.id)).toHaveLength(1);
    expect(await authService.accountExists('elif@posta.com')).toBe(true);
    await accountDataService.deleteAccount(first.id);
    expect(await authService.accountExists('elif@posta.com')).toBe(false);
  });
});
