import { create } from 'zustand';
import { statsRepo } from '../api/statsRepo';
import type { SessionStat } from './types';

// Statistika yagona manbai: yakunlangan sessiyalarni SQLite'dan yuklaydi.
// Ekran focus'ida load() chaqiriladi (sessiya tugagach Dashboard/Stats yangilanadi).
interface StatsState {
  sessions: SessionStat[];
  /** load() bo'lib o'tgan vaqt — barcha hisoblar uchun barqaror `now`. */
  loadedAt: number;
  loaded: boolean;
  load: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  sessions: [],
  loadedAt: 0,
  loaded: false,
  load: async () => {
    const sessions = await statsRepo.listSessionStats();
    set({ sessions, loadedAt: Date.now(), loaded: true });
  },
}));
