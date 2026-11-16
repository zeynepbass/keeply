import { readJson, storageKey, writeJson } from '@/shared/lib/storage';

import type { StoredUser } from '../types';

const USERS_KEY = storageKey('users');

let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const userRepository = {
  list(): Promise<StoredUser[]> {
    return readJson<StoredUser[]>(USERS_KEY, []);
  },
  async findById(id: string): Promise<StoredUser | null> {
    const users = await this.list();
    return users.find((user) => user.id === id) ?? null;
  },
  async findByEmail(email: string): Promise<StoredUser | null> {
    const normalized = normalizeEmail(email);
    const users = await this.list();
    return users.find((user) => user.email === normalized) ?? null;
  },
  insert(user: StoredUser): Promise<StoredUser> {
    return serialize(async () => {
      const users = await readJson<StoredUser[]>(USERS_KEY, []);
      await writeJson(USERS_KEY, [...users, user]);
      return user;
    });
  },
  update(id: string, changes: Partial<Omit<StoredUser, 'id'>>): Promise<StoredUser | null> {
    return serialize(async () => {
      const users = await readJson<StoredUser[]>(USERS_KEY, []);
      const index = users.findIndex((user) => user.id === id);
      if (index === -1) {
        return null;
      }
      const updated = { ...users[index], ...changes };
      const next = [...users];
      next[index] = updated;
      await writeJson(USERS_KEY, next);
      return updated;
    });
  },
  remove(id: string): Promise<void> {
    return serialize(async () => {
      const users = await readJson<StoredUser[]>(USERS_KEY, []);
      await writeJson(
        USERS_KEY,
        users.filter((user) => user.id !== id),
      );
    });
  },
};
