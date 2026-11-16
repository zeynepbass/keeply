import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-crypto', () => {
  let counter = 0;
  return {
    randomUUID: () => {
      counter += 1;
      return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
    },
    getRandomBytes: (size: number) => new Uint8Array(size).map((_, index) => (index * 31 + 7) % 256),
    digestStringAsync: async (_algorithm: string, data: string) => {
      let hash = 0;
      for (let index = 0; index < data.length; index += 1) {
        hash = (hash * 31 + data.charCodeAt(index)) | 0;
      }
      return `h${(hash >>> 0).toString(16)}`;
    },
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  };
});

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: async (key: string) => store.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => {
      store.set(key, value);
    },
    deleteItemAsync: async (key: string) => {
      store.delete(key);
    },
  };
});
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: jest.fn() }, SaveFormat: { JPEG: 'jpeg' } }));
