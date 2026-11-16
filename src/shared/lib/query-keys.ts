export const queryKeys = {
  products: {
    all: (userId: string) => ['products', userId] as const,
    detail: (userId: string, productId: string) => ['products', userId, productId] as const,
  },
  activities: {
    all: (userId: string) => ['activities', userId] as const,
  },
  documents: {
    all: (userId: string) => ['documents', userId] as const,
  },
  serviceRecords: {
    all: (userId: string) => ['service-records', userId] as const,
  },
  reminders: {
    all: (userId: string) => ['reminders', userId] as const,
  },
  notificationPreferences: {
    detail: (userId: string) => ['notification-preferences', userId] as const,
  },
  inboxState: {
    detail: (userId: string) => ['inbox-state', userId] as const,
  },
} as const;
