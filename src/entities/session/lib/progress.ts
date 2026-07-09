import { periodWindow, type Period } from '@shared/lib/time/periodWindow';
import { sessionRepo } from '../api/sessionRepo';

// Odatning joriy davr oynasida (kunlik/haftalik/oylik) bajarilgan (completed=true)
// sessiyalar soni — habit progress manbai (2026-07-08, necha-marta modeli).
// (Habit entity'ni import qilmaymiz — literal parametrlar, cross-slice toza.)
export async function windowCompletedCount(
  habitId: string,
  period: Period,
  now: number,
): Promise<number> {
  const w = periodWindow(period, now);
  return sessionRepo.countCompleted(habitId, w.from, w.to);
}

// Joriy davr oynasida sarflangan jami vaqt — informatsion statistika ("sarflangan"),
// progress emas.
export async function windowElapsedMs(
  habitId: string,
  period: Period,
  now: number,
): Promise<number> {
  const w = periodWindow(period, now);
  return sessionRepo.sumDurationMs(habitId, w.from, w.to);
}
