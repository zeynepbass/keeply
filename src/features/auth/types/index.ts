export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isDemo: boolean;
}

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}
