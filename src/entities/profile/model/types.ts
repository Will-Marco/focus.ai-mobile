export type AuthMode = 'guest' | 'registered';

export interface Profile {
  name: string;
  email: string | null;
  /** E.164 (+998...) — Telegram orqali tasdiqlangan telefon bilan ro'yxatdan o'tganda. */
  phone: string | null;
  authMode: AuthMode;
  createdAt: number;
}

export const GUEST_NAME = 'Mehmon';
