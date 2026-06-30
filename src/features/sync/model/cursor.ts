import { storage } from '@shared/lib/storage/mmkv';

// Sync kursorlari (eng katta ko'rilgan updated_at) MMKV'da — jadval+yo'nalish bo'yicha.
export type CursorKey = 'habits_push' | 'habits_pull' | 'sessions_push' | 'sessions_pull';

const prefix = (k: CursorKey) => `sync-cursor:${k}`;

export const cursor = {
  get: (k: CursorKey): number => storage.getNumber(prefix(k)) ?? 0,
  set: (k: CursorKey, value: number): void => {
    storage.set(prefix(k), value);
  },
  reset: (): void => {
    (['habits_push', 'habits_pull', 'sessions_push', 'sessions_pull'] as CursorKey[]).forEach((k) =>
      storage.remove(prefix(k)),
    );
  },
};
