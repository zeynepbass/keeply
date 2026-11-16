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

jest.mock('expo-notifications', () => {
  let counter = 0;
  const scheduled = new Map<string, unknown>();
  return {
    __scheduled: scheduled,
    __permission: { granted: true, canAskAgain: true },
    getPermissionsAsync: jest.fn(async function getPermissionsAsync() {
      return jest.requireMock('expo-notifications').__permission;
    }),
    requestPermissionsAsync: jest.fn(async () => jest.requireMock('expo-notifications').__permission),
    scheduleNotificationAsync: jest.fn(async (request: unknown) => {
      counter += 1;
      const id = `bildirim-${counter}`;
      scheduled.set(id, request);
      return id;
    }),
    cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
      scheduled.delete(id);
    }),
    cancelAllScheduledNotificationsAsync: jest.fn(async () => scheduled.clear()),
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    getLastNotificationResponse: jest.fn(() => null),
    addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    SchedulableTriggerInputTypes: { DATE: 'date' },
    AndroidImportance: { DEFAULT: 3 },
  };
});
