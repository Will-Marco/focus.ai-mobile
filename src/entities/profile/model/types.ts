export type AuthMode = 'guest' | 'registered';

export interface Profile {
  name: string;
  email: string | null;
  authMode: AuthMode;
  createdAt: number;
}

export const GUEST_NAME = 'Mehmon';
