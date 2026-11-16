import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppError } from '@/shared/lib/errors';

import { authService } from './auth-service';
import { userRepository } from './user-repository';

const input = { name: 'Elif Yılmaz', email: 'Elif.Yilmaz@Email.com ', password: 'guvenli123' };

describe('authService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await authService.logout();
  });

  it('registers a user with a normalized email and hashed password', async () => {
    const user = await authService.register(input);
    expect(user.email).toBe('elif.yilmaz@email.com');
    const stored = await userRepository.findById(user.id);
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toContain('guvenli123');
    await expect(authService.restoreSession()).resolves.toMatchObject({ id: user.id });
  });

  it('rejects duplicate emails', async () => {
    await authService.register(input);
    await expect(authService.register({ ...input, email: 'elif.yilmaz@email.com' })).rejects.toMatchObject({ code: 'conflict' });
  });

  it('logs in with valid credentials and rejects invalid ones', async () => {
    await authService.register(input);
    await authService.logout();
    await expect(authService.restoreSession()).resolves.toBeNull();
    await expect(authService.login('elif.yilmaz@email.com', 'yanlis1234')).rejects.toBeInstanceOf(AppError);
    const user = await authService.login('ELIF.YILMAZ@email.com', 'guvenli123');
    expect(user.name).toBe('Elif Yılmaz');
  });

  it('resets and changes passwords', async () => {
    const user = await authService.register(input);
    await authService.resetPassword('elif.yilmaz@email.com', 'yenisifre99');
    await expect(authService.login('elif.yilmaz@email.com', 'guvenli123')).rejects.toBeInstanceOf(AppError);
    await authService.login('elif.yilmaz@email.com', 'yenisifre99');
    await expect(authService.changePassword(user.id, 'hatali000', 'baska1234')).rejects.toMatchObject({ code: 'validation' });
    await authService.changePassword(user.id, 'yenisifre99', 'baska1234');
    await expect(authService.login('elif.yilmaz@email.com', 'baska1234')).resolves.toMatchObject({ id: user.id });
  });

  it('updates the profile and prevents taking another email', async () => {
    const first = await authService.register(input);
    await authService.register({ name: 'Can Demir', email: 'can@email.com', password: 'sifre1234' });
    await expect(authService.updateProfile(first.id, { name: 'Elif Y.', email: 'can@email.com' })).rejects.toMatchObject({
      code: 'conflict',
    });
    const updated = await authService.updateProfile(first.id, { name: ' Elif Kaya ', email: 'elif.kaya@email.com' });
    expect(updated).toMatchObject({ name: 'Elif Kaya', email: 'elif.kaya@email.com' });
  });

  it('clears the session when the stored user no longer exists', async () => {
    const user = await authService.register(input);
    await userRepository.remove(user.id);
    await expect(authService.restoreSession()).resolves.toBeNull();
  });
});
