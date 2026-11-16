import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'keeply.session.user';

export const sessionStorage = {
  async read(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(SESSION_KEY);
    } catch {
      return null;
    }
  },
  async write(userId: string): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, userId);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
