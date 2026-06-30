import { create } from 'zustand';
import { uuid } from '@shared/lib/id';
import { sessionRepo } from '../api/sessionRepo';
import { elapsedMs, isComplete, msToMinutes, pauseSession, resumeSession } from '../lib/timer';
import { activeSessionStorage } from './activeSessionStorage';
import type { ActiveSession } from './types';

export interface FinishResult {
  completed: boolean;
  durationMs: number;
  minutes: number;
  awayMs: number;
}

interface SessionState {
  active: ActiveSession[];
  /** MMKV'dan qaynoq sessiyalarni tiklaydi (FR-2.8). */
  hydrate: () => void;
  /** Yangi sessiya boshlaydi (darhol running). */
  start: (input: { habitId: string; targetMin: number; now?: number }) => ActiveSession;
  pause: (id: string, now?: number) => void;
  resume: (id: string, now?: number) => void;
  /** Yakunlaydi: completed sessiyani SQLite'ga yozadi, active'dan olib tashlaydi. */
  finish: (id: string, opts?: { awayMs?: number; now?: number }) => Promise<FinishResult | null>;
  /** Yozmasdan bekor qiladi (reset/tashlab ketish). */
  discard: (id: string) => void;
  byId: (id: string) => ActiveSession | undefined;
}

// Zustand state'ni MMKV'ga doimiy aks ettiradi (manba — MMKV, reaktiv — Zustand).
function persist(active: ActiveSession[]): void {
  // har sessiyani alohida yozish o'rniga to'liq holatni sinxron saqlaymiz
  activeSessionStorage.clear();
  active.forEach((s) => activeSessionStorage.upsert(s));
}

export const useSessionStore = create<SessionState>((set, get) => ({
  active: [],

  hydrate: () => set({ active: activeSessionStorage.getAll() }),

  start: ({ habitId, targetMin, now = Date.now() }) => {
    const session: ActiveSession = {
      id: uuid(),
      habitId,
      targetMin,
      accumulatedMs: 0,
      runningSince: now,
      isForeground: true,
      startedAt: now,
    };
    const active = [...get().active, session];
    set({ active });
    persist(active);
    return session;
  },

  pause: (id, now = Date.now()) => {
    const active = get().active.map((s) => (s.id === id ? pauseSession(s, now) : s));
    set({ active });
    persist(active);
  },

  resume: (id, now = Date.now()) => {
    const active = get().active.map((s) => (s.id === id ? resumeSession(s, now) : s));
    set({ active });
    persist(active);
  },

  finish: async (id, { awayMs = 0, now = Date.now() } = {}) => {
    const session = get().active.find((s) => s.id === id);
    if (!session) return null;

    const durationMs = elapsedMs(session, now);
    const completed = isComplete(durationMs, session.targetMin);
    // away vaqti haqiqiy davomiylikdan oshmasin (himoya).
    const safeAwayMs = Math.max(0, Math.min(awayMs, durationMs));
    await sessionRepo.insert({
      habitId: session.habitId,
      durationMs,
      targetMinutes: session.targetMin,
      completed,
      awayMs: safeAwayMs,
      startedAt: session.startedAt,
      endedAt: now,
    });

    const active = get().active.filter((s) => s.id !== id);
    set({ active });
    persist(active);
    return { completed, durationMs, minutes: msToMinutes(durationMs), awayMs: safeAwayMs };
  },

  discard: (id) => {
    const active = get().active.filter((s) => s.id !== id);
    set({ active });
    persist(active);
  },

  byId: (id) => get().active.find((s) => s.id === id),
}));
