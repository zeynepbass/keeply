import AsyncStorage from '@react-native-async-storage/async-storage';

import { t } from '@/shared/i18n';

import { AppError } from './errors';

const PREFIX = 'keeply';

export function storageKey(...parts: string[]): string {
  return [PREFIX, ...parts].join(':');
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    throw new AppError('storage', t.errors.storageRead);
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new AppError('storage', t.errors.storageWrite);
  }
}

export async function removeKeys(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    throw new AppError('storage', t.errors.storageRemove);
  }
}

export async function listKeys(prefix: string): Promise<string[]> {
  const keys = await AsyncStorage.getAllKeys();
  return keys.filter((key) => key.startsWith(prefix));
}

export interface Entity {
  id: string;
}

export interface Collection<T extends Entity> {
  list(userId: string): Promise<T[]>;
  get(userId: string, id: string): Promise<T | null>;
  insert(userId: string, item: T): Promise<T>;
  update(userId: string, id: string, changes: Partial<T>): Promise<T>;
  remove(userId: string, id: string): Promise<void>;
  removeWhere(userId: string, predicate: (item: T) => boolean): Promise<T[]>;
  replaceAll(userId: string, items: T[]): Promise<void>;
}

export function createCollection<T extends Entity>(name: string, notFoundMessage: string): Collection<T> {
  const keyFor = (userId: string) => storageKey('user', userId, name);
  const queues = new Map<string, Promise<unknown>>();

  function serialize<R>(userId: string, task: () => Promise<R>): Promise<R> {
    const previous = queues.get(userId) ?? Promise.resolve();
    const next = previous.then(task, task);
    queues.set(
      userId,
      next.catch(() => undefined),
    );
    return next;
  }

  const list = (userId: string) => readJson<T[]>(keyFor(userId), []);

  return {
    list,
    async get(userId, id) {
      const items = await list(userId);
      return items.find((item) => item.id === id) ?? null;
    },
    insert(userId, item) {
      return serialize(userId, async () => {
        const items = await list(userId);
        await writeJson(keyFor(userId), [...items, item]);
        return item;
      });
    },
    update(userId, id, changes) {
      return serialize(userId, async () => {
        const items = await list(userId);
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) {
          throw new AppError('not_found', notFoundMessage);
        }
        const updated = { ...items[index], ...changes, id };
        const next = [...items];
        next[index] = updated;
        await writeJson(keyFor(userId), next);
        return updated;
      });
    },
    remove(userId, id) {
      return serialize(userId, async () => {
        const items = await list(userId);
        await writeJson(
          keyFor(userId),
          items.filter((item) => item.id !== id),
        );
      });
    },
    removeWhere(userId, predicate) {
      return serialize(userId, async () => {
        const items = await list(userId);
        const removed = items.filter(predicate);
        if (removed.length > 0) {
          await writeJson(
            keyFor(userId),
            items.filter((item) => !predicate(item)),
          );
        }
        return removed;
      });
    },
    replaceAll(userId, items) {
      return serialize(userId, () => writeJson(keyFor(userId), items));
    },
  };
}
