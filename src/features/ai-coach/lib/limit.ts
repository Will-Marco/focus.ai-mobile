import { startOfDay } from '@shared/lib/time/day';

// Bepul tier: kuniga 5 marta AI insight so'rovi (SRS FR-10.3).
export const DAILY_LIMIT = 5;

/** Kunlik ishlatilish yozuvi (MMKV'da saqlanadi). */
export interface UsageRecord {
  /** Kun kaliti = startOfDay(ts). */
  day: number;
  /** Shu kundagi so'rovlar soni. */
  count: number;
}

/** Bugungi kun kaliti (lokal, DST-safe). */
export function todayKey(now: number): number {
  return startOfDay(now);
}

/** Bugungi ishlatilish soni (yozuv boshqa kunniki bo'lsa 0 — avtomatik reset). */
export function usageToday(record: UsageRecord | null, now: number): number {
  if (!record || record.day !== todayKey(now)) return 0;
  return record.count;
}

/** Yana so'rov qilsa bo'ladimi (limitga yetmagan). */
export function canFetch(record: UsageRecord | null, now: number, limit = DAILY_LIMIT): boolean {
  return usageToday(record, now) < limit;
}

/** So'rovdan keyingi yangi yozuv (kun almashsa 1 dan boshlaydi). */
export function recordFetch(record: UsageRecord | null, now: number): UsageRecord {
  return { day: todayKey(now), count: usageToday(record, now) + 1 };
}

/** Bugun qolgan so'rovlar soni. */
export function remaining(record: UsageRecord | null, now: number, limit = DAILY_LIMIT): number {
  return Math.max(0, limit - usageToday(record, now));
}
