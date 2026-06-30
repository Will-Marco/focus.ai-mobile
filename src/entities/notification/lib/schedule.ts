// Bildirishnoma jadvali — sof (pure) mantiq. `now` parametr sifatida (deterministik test).
import { isInQuietRange, parseHm } from './quietHours';

const DAY_MS = 86_400_000;

/**
 * `now`dan keyingi navbatdagi kunlik `atMinute` (lokal) epoch-ms.
 * Agar bugungi vaqt o'tib ketgan bo'lsa — ertangi kun.
 */
export function nextDailyAtMinute(nowMs: number, atMinute: number): number {
  const now = new Date(nowMs);
  const t = new Date(nowMs);
  t.setHours(Math.floor(atMinute / 60), atMinute % 60, 0, 0);
  let ts = t.getTime();
  if (ts <= now.getTime()) ts += DAY_MS;
  return ts;
}

/**
 * `now`dan keyingi navbatdagi kunlik `weekday` (0=Yak..6=Shanba) `atMinute` epoch-ms.
 * Bugun shu kun va vaqt hali kelmagan bo'lsa — bugun; aks holda keyingi hafta.
 */
export function nextWeeklyAtMinute(nowMs: number, weekday: number, atMinute: number): number {
  const t = new Date(nowMs);
  t.setHours(Math.floor(atMinute / 60), atMinute % 60, 0, 0);
  let delta = (weekday - t.getDay() + 7) % 7;
  if (delta === 0 && t.getTime() <= nowMs) delta = 7;
  return t.getTime() + delta * DAY_MS;
}

export interface QuietConfig {
  enabled: boolean;
  start: string;
  end: string;
}

/**
 * Kunlik eslatma vaqti tinch oraliqqa tushsa — tinch tugagan paytga suriladi.
 * Aks holda asl vaqtda qoladi. Natija — keyingi navbatdagi epoch-ms.
 */
export function nextReminderTrigger(nowMs: number, reminderTime: string, quiet: QuietConfig): number {
  const reminderMin = parseHm(reminderTime);
  if (quiet.enabled) {
    const startMin = parseHm(quiet.start);
    const endMin = parseHm(quiet.end);
    if (isInQuietRange(reminderMin, startMin, endMin)) {
      return nextDailyAtMinute(nowMs, endMin);
    }
  }
  return nextDailyAtMinute(nowMs, reminderMin);
}
