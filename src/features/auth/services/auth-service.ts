import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';
import { createId } from '@/shared/lib/id';

import type { StoredUser, User } from '../types';
import { createSalt, hashPassword, verifyPassword } from './password-hasher';
import { sessionStorage } from './session-storage';
import { normalizeEmail, userRepository } from './user-repository';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

function toPublicUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, isDemo: user.isDemo };
}

async function requireUser(userId: string): Promise<StoredUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('unauthorized', t.auth.sessionExpired);
  }
  return user;
}

export const authService = {
  async restoreSession(): Promise<User | null> {
    const userId = await sessionStorage.read();
    if (!userId) {
      return null;
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      await sessionStorage.clear();
      return null;
    }
    return toPublicUser(user);
  },

  async register(input: RegisterInput, options: { isDemo?: boolean } = {}): Promise<User> {
    const email = normalizeEmail(input.email);
    if (await userRepository.findByEmail(email)) {
      throw new AppError('conflict', t.auth.emailTaken);
    }
    const salt = createSalt();
    const user: StoredUser = {
      id: createId(),
      name: input.name.trim(),
      email,
      createdAt: new Date().toISOString(),
      isDemo: options.isDemo ?? false,
      salt,
      passwordHash: await hashPassword(input.password, salt),
    };
    await userRepository.insert(user);
    await sessionStorage.write(user.id);
    return toPublicUser(user);
  },

  async login(email: string, password: string): Promise<User> {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.salt, user.passwordHash))) {
      throw new AppError('unauthorized', t.auth.invalidCredentials);
    }
    await sessionStorage.write(user.id);
    return toPublicUser(user);
  },

  async logout(): Promise<void> {
    await sessionStorage.clear();
  },

  async accountExists(email: string): Promise<boolean> {
    return (await userRepository.findByEmail(email)) !== null;
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('not_found', t.auth.accountNotFound);
    }
    const salt = createSalt();
    await userRepository.update(user.id, { salt, passwordHash: await hashPassword(newPassword, salt) });
  },

  async updateProfile(userId: string, changes: { name: string; email: string }): Promise<User> {
    const current = await requireUser(userId);
    const email = normalizeEmail(changes.email);
    if (email !== current.email) {
      const existing = await userRepository.findByEmail(email);
      if (existing && existing.id !== userId) {
        throw new AppError('conflict', t.auth.emailTaken);
      }
    }
    const updated = await userRepository.update(userId, { name: changes.name.trim(), email });
    if (!updated) {
      throw new AppError('unauthorized', t.auth.sessionExpired);
    }
    return toPublicUser(updated);
  },

  async changePassword(userId: string, currentPassword: string, nextPassword: string): Promise<void> {
    const user = await requireUser(userId);
    if (!(await verifyPassword(currentPassword, user.salt, user.passwordHash))) {
      throw new AppError('validation', t.auth.currentPasswordWrong);
    }
    const salt = createSalt();
    await userRepository.update(userId, { salt, passwordHash: await hashPassword(nextPassword, salt) });
  },

  async deleteAccount(userId: string): Promise<void> {
    await userRepository.remove(userId);
    await sessionStorage.clear();
  },
};
