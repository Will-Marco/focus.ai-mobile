import { activeDaySet } from '@shared/lib/time/day';
import type { SessionStat } from './types';

// XP qoidalari (FR-6.3):
//   • 1 XP / fokus daqiqasi
//   • +50 sessiya 100% bajarilsa
//   • phone-down (Away) daqiqalari 2× (ya'ni away daqiqasi qo'shimcha 1 XP)
//   • +10 har faol kun uchun (kunlik streak bonusi)

const MIN_MS = 60_000;
const COMPLETE_BONUS = 50;
const DAILY_BONUS = 10;

const minutes = (ms: number) => Math.floor(ms / MIN_MS);

/** Bitta sessiya XP'si (kunlik bonussiz). */
export function sessionXp(s: SessionStat): number {
  const focus = minutes(s.durationMs);
  const away = minutes(s.awayMs); // 2× → bir marta qo'shimcha
  return focus + away + (s.completed ? COMPLETE_BONUS : 0);
}

/** Barcha sessiyalar bo'yicha jami XP (faol-kun bonusi bilan). */
export function totalXp(sessions: SessionStat[]): number {
  const base = sessions.reduce((sum, s) => sum + sessionXp(s), 0);
  const days = activeDaySet(sessions.map((s) => s.startedAt)).size;
  return base + days * DAILY_BONUS;
}

export interface LevelInfo {
  level: number;
  /** joriy darajaga kirgan XP. */
  current: number;
  /** joriy darajadan keyingisiga o'tish uchun kerak XP. */
  span: number;
  /** joriy daraja boshlangan kümülativ XP. */
  floorXp: number;
}

/** Daraja chizig'i: L→L+1 uchun kerak = 100 + (L-1)*50 (100,150,200,…). */
function spanFor(level: number): number {
  return 100 + (level - 1) * 50;
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let floorXp = 0;
  let span = spanFor(level);
  while (xp >= floorXp + span) {
    floorXp += span;
    level += 1;
    span = spanFor(level);
  }
  return { level, current: xp - floorXp, span, floorXp };
}
