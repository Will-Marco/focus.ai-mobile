import { storage } from '@shared/lib/storage/mmkv';
import type { ActiveSession } from './types';

// Qaynoq active sessiyalar MMKV'da JSON massiv sifatida (ko'p parallel sessiya;
// timestamp asosida — ilova yopilsa ham qayta ochilganda aniq tiklanadi).
const KEY = 'active-sessions';

function readAll(): ActiveSession[] {
  const raw = storage.getString(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActiveSession[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: ActiveSession[]): void {
  storage.set(KEY, JSON.stringify(list));
}

export const activeSessionStorage = {
  getAll: readAll,

  upsert(session: ActiveSession): void {
    const list = readAll();
    const i = list.findIndex((s) => s.id === session.id);
    if (i >= 0) list[i] = session;
    else list.push(session);
    writeAll(list);
  },

  remove(id: string): void {
    writeAll(readAll().filter((s) => s.id !== id));
  },

  clear(): void {
    storage.remove(KEY);
  },
};
