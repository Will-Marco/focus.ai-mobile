import { periodWindow, type Period } from '@shared/lib/time/periodWindow';
import { sessionRepo } from '../api/sessionRepo';

// Odatning joriy davr oynasidagi to'plangan vaqti (yakunlangan sessiyalardan).
// cumulative — butun tarix; recurring — joriy davr (daily/weekly/monthly).
// (Habit entity'ni import qilmaymiz — literal parametrlar, cross-slice toza.)
export async function windowElapsedMs(
  habitId: string,
  type: 'cumulative' | 'recurring',
  period: Period | null,
  now: number,
): Promise<number> {
  if (type === 'recurring' && period) {
    const w = periodWindow(period, now);
    return sessionRepo.sumDurationMs(habitId, w.from, w.to);
  }
  return sessionRepo.sumDurationMs(habitId, 0, now + 1);
}
