import type { ActiveSession } from '../model/types';

// Timestamp asosidagi pure taymer matematikasi. setInterval'siz — vaqt har doim
// `now`'dan hisoblanadi, shuning uchun ilova yopilsa/uxlasa ham aniq (FR-2.4).

const MS_PER_MIN = 60_000;

/** Joriy o'tgan vaqt (ms). Running bo'lsa real-time, pauza bo'lsa to'plangan. */
export function elapsedMs(s: ActiveSession, now: number): number {
  const live = s.runningSince === null ? 0 : now - s.runningSince;
  return Math.max(0, s.accumulatedMs + live);
}

export function isRunning(s: ActiveSession): boolean {
  return s.runningSince !== null;
}

/** O'tgan vaqtni accumulated'ga ko'chiradi, to'xtatadi. Idempotent. */
export function pauseSession(s: ActiveSession, now: number): ActiveSession {
  if (s.runningSince === null) return s;
  return {
    ...s,
    accumulatedMs: Math.max(0, s.accumulatedMs + (now - s.runningSince)),
    runningSince: null,
  };
}

/** Taymerni qayta yuritadi (runningSince=now). Idempotent. */
export function resumeSession(s: ActiveSession, now: number): ActiveSession {
  if (s.runningSince !== null) return s;
  return { ...s, runningSince: now };
}

/** 0..1 — ring to'lishi. Maqsaddan oshsa 1 ga clamp (vizual oshmaydi, FR-2.6). */
export function progress(elapsed: number, targetMin: number): number {
  if (targetMin <= 0) return 0;
  return Math.min(1, elapsed / (targetMin * MS_PER_MIN));
}

export function isComplete(elapsed: number, targetMin: number): boolean {
  return elapsed >= targetMin * MS_PER_MIN;
}

/** Qolgan vaqt (ms), manfiy emas. */
export function remainingMs(elapsed: number, targetMin: number): number {
  return Math.max(0, targetMin * MS_PER_MIN - elapsed);
}

/** Finish'da odatga qo'shiladigan daqiqalar (eng yaqinga yaxlitlash). */
export function msToMinutes(ms: number): number {
  return Math.round(ms / MS_PER_MIN);
}
