import { addDays, startOfDay } from '@shared/lib/time/day';
import type { SessionStat } from './types';

const MIN_MS = 60_000;

export type ChartPeriod = 'week' | 'month' | 'year';

export interface ChartSeries {
  /** har ustun (kun/hafta/oy) uchun daqiqalar. */
  mins: number[];
  /** jami daqiqa (joriy davr). */
  totalMin: number;
  /** oldingi davrga nisbatan foiz (yaxlitlangan butun son); null = taqqoslab bo'lmaydi. */
  comparePct: number | null;
  /** o'sish yo'nalishi (comparePct >= 0). */
  up: boolean;
}

export interface HeatmapData {
  /** 53 hafta × 7 kun (Du..Ya) daraja matritsasi (0..4). */
  weeks: number[][];
  /** oxirgi yilda faol kunlar soni. */
  activeDays: number;
}

const minutes = (ms: number) => Math.floor(ms / MIN_MS);

/** Kun boshi (ts) → shu kundagi jami daqiqa. */
export function dailyMinutes(sessions: SessionStat[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const s of sessions) {
    const day = startOfDay(s.startedAt);
    map.set(day, (map.get(day) ?? 0) + minutes(s.durationMs));
  }
  return map;
}

/** Daqiqa → heatmap darajasi (0..4). Bo'sh = 0. */
export function heatLevel(min: number): number {
  if (min <= 0) return 0;
  if (min < 30) return 1;
  if (min < 60) return 2;
  if (min < 120) return 3;
  return 4;
}

/**
 * Oxirgi 365 kun heatmap'i. Eng o'ng ustun — joriy hafta (Du boshi).
 * weeks[col][row]: row 0=Dushanba … 6=Yakshanba.
 */
export function buildHeatmap(sessions: SessionStat[], now: number, weeksCount = 53): HeatmapData {
  const daily = dailyMinutes(sessions);
  const today = startOfDay(now);
  // joriy haftaning dushanbasi
  const dow = (new Date(today).getDay() + 6) % 7; // 0=Du
  const thisMonday = addDays(today, -dow);

  const weeks: number[][] = [];
  let activeDays = 0;
  for (let w = weeksCount - 1; w >= 0; w -= 1) {
    const monday = addDays(thisMonday, -w * 7);
    const col: number[] = [];
    for (let d = 0; d < 7; d += 1) {
      const dayTs = addDays(monday, d);
      const min = dayTs <= today ? (daily.get(dayTs) ?? 0) : 0;
      if (min > 0) activeDays += 1;
      col.push(heatLevel(min));
    }
    weeks.push(col);
  }
  return { weeks, activeDays };
}

// ---- Grafiklar (hafta/oy/yil) ----

function rangeMinutes(sessions: SessionStat[], from: number, to: number): number {
  let total = 0;
  for (const s of sessions) {
    if (s.startedAt >= from && s.startedAt < to) total += minutes(s.durationMs);
  }
  return total;
}

/** Joriy va oldingi davr chegaralarini + ustun seriyasini qaytaradi. */
export function buildSeries(period: ChartPeriod, sessions: SessionStat[], now: number): ChartSeries {
  const today = startOfDay(now);
  let mins: number[];
  let curFrom: number;
  let curTo: number;
  let prevFrom: number;
  let prevTo: number;

  if (period === 'week') {
    const dow = (new Date(today).getDay() + 6) % 7;
    const monday = addDays(today, -dow);
    curFrom = monday;
    curTo = addDays(monday, 7);
    prevFrom = addDays(monday, -7);
    prevTo = monday;
    mins = Array.from({ length: 7 }, (_, i) => rangeMinutes(sessions, addDays(monday, i), addDays(monday, i + 1)));
  } else if (period === 'month') {
    const d = new Date(today);
    const first = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();
    curFrom = first;
    curTo = next;
    prevFrom = prev;
    prevTo = first;
    // 4 hafta-segment (1-7, 8-14, 15-21, 22-oxiri)
    mins = [0, 1, 2, 3].map((wi) => {
      const segFrom = addDays(first, wi * 7);
      const segTo = wi === 3 ? next : addDays(first, (wi + 1) * 7);
      return rangeMinutes(sessions, segFrom, segTo);
    });
  } else {
    const d = new Date(today);
    const yStart = new Date(d.getFullYear(), 0, 1).getTime();
    const yNext = new Date(d.getFullYear() + 1, 0, 1).getTime();
    const yPrev = new Date(d.getFullYear() - 1, 0, 1).getTime();
    curFrom = yStart;
    curTo = yNext;
    prevFrom = yPrev;
    prevTo = yStart;
    mins = Array.from({ length: 12 }, (_, m) => {
      const segFrom = new Date(d.getFullYear(), m, 1).getTime();
      const segTo = new Date(d.getFullYear(), m + 1, 1).getTime();
      return rangeMinutes(sessions, segFrom, segTo);
    });
  }

  const totalMin = rangeMinutes(sessions, curFrom, curTo);
  const prevTotal = rangeMinutes(sessions, prevFrom, prevTo);
  let comparePct: number | null;
  if (prevTotal === 0) {
    comparePct = totalMin === 0 ? null : 100;
  } else {
    comparePct = Math.round(((totalMin - prevTotal) / prevTotal) * 100);
  }
  return { mins, totalMin, comparePct, up: (comparePct ?? 0) >= 0 };
}

/** Oxirgi 7 kun (Du..Ya) bajarildi belgilari — Dashboard/Stats "7 kun" qatori. */
export function last7Done(active: Set<number>, now: number): boolean[] {
  const today = startOfDay(now);
  const dow = (new Date(today).getDay() + 6) % 7;
  const monday = addDays(today, -dow);
  return Array.from({ length: 7 }, (_, i) => active.has(addDays(monday, i)));
}
