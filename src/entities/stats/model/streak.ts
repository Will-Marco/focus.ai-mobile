import { addDays, startOfDay } from '@shared/lib/time/day';

// Streak hisoblash (pure). Faol kun = shu kuni ≥1 yakunlangan sessiya.
//
// Auto-freeze (FR-6.1 "hafta 1"): consumable store o'rniga derivable qoida —
// streak'ni orqaga yurganda BITTA bo'sh kun ("muzlatilgan") ustidan o'tib ketadi,
// lekin har 7 streak-kunга faqat 1 marta. Ketma-ket 2+ bo'sh kun har doim uzadi.

const FREEZE_REGEN_DAYS = 7;

export interface StreakResult {
  current: number;
  longest: number;
}

/** Joriy streak: bugundan (yoki kechadan) orqaga, auto-freeze bilan. */
export function currentStreak(active: Set<number>, now: number): number {
  const today = startOfDay(now);

  // Anchor: bugun faol bo'lsa bugundan; aks holda kecha faol bo'lsa kechadan
  // (bugun hali tugamagan — streak buzilmaydi). Ikkalasi ham bo'sh → 0.
  let day: number;
  if (active.has(today)) {
    day = today;
  } else if (active.has(addDays(today, -1))) {
    day = addDays(today, -1);
  } else {
    return 0;
  }

  let count = 1;
  let freezeAvailable = true; // boshlanishda 1 freeze
  let sinceFreeze = 0;

  for (;;) {
    const prev = addDays(day, -1);
    if (active.has(prev)) {
      count += 1;
      day = prev;
      sinceFreeze += 1;
      if (sinceFreeze >= FREEZE_REGEN_DAYS) freezeAvailable = true;
      continue;
    }
    // Bo'sh kun — bitta bo'sh kunni "muzlatib" o'tib bo'ladimi?
    const prev2 = addDays(prev, -1);
    if (freezeAvailable && active.has(prev2)) {
      freezeAvailable = false;
      sinceFreeze = 0;
      count += 1; // prev2 faol kun — sanaladi (bo'sh kun sanalmaydi)
      day = prev2;
      continue;
    }
    break;
  }

  return count;
}

/** Eng uzun rekord: freeze'siz ketma-ket faol kunlar (haqiqiy rekord). */
export function longestStreak(active: Set<number>): number {
  if (active.size === 0) return 0;
  const days = [...active].sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i] === addDays(days[i - 1], 1)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

export function streakStats(active: Set<number>, now: number): StreakResult {
  return { current: currentStreak(active, now), longest: longestStreak(active) };
}
