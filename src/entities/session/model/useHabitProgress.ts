import { useEffect, useState } from 'react';
import type { Period } from '@shared/lib/time/periodWindow';
import { windowCompletedCount, windowElapsedMs } from '../lib/progress';

export interface HabitProgressInput {
  habitId: string;
  period: Period;
  targetCount: number;
}

export interface HabitProgress {
  /** joriy davr oynasida bajarilgan (completed=true) sessiyalar soni. */
  completedCount: number;
  /** joriy davr oynasida sarflangan jami vaqt (ms) — informatsion, progress emas. */
  elapsedMs: number;
  /** completedCount / targetCount, 1 bilan cheklangan. */
  progress: number;
}

// Odat progress'ini SQLite'dan o'qiydi. refreshKey o'zgarsa qayta hisoblaydi
// (sessiya yakunlanganda — finish counter / active count orqali).
export function useHabitProgress(input: HabitProgressInput, refreshKey: number): HabitProgress {
  const [completedCount, setCompletedCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let on = true;
    const now = Date.now();
    Promise.all([
      windowCompletedCount(input.habitId, input.period, now),
      windowElapsedMs(input.habitId, input.period, now),
    ]).then(([count, ms]) => {
      if (!on) return;
      setCompletedCount(count);
      setElapsedMs(ms);
    });
    return () => {
      on = false;
    };
  }, [input.habitId, input.period, input.targetCount, refreshKey]);

  const progress =
    input.targetCount > 0 ? Math.min(1, completedCount / input.targetCount) : 0;
  return { completedCount, elapsedMs, progress };
}
