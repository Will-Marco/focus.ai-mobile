import { useEffect, useState } from 'react';
import type { Period } from '@shared/lib/time/periodWindow';
import { windowElapsedMs } from '../lib/progress';

export interface HabitProgressInput {
  habitId: string;
  type: 'cumulative' | 'recurring';
  period: Period | null;
  targetMinutes: number;
}

export interface HabitProgress {
  elapsedMs: number;
  progress: number;
}

// Odat progress'ini SQLite'dan o'qiydi. refreshKey o'zgarsa qayta hisoblaydi
// (sessiya yakunlanganda — finish counter / active count orqali).
export function useHabitProgress(input: HabitProgressInput, refreshKey: number): HabitProgress {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let on = true;
    windowElapsedMs(input.habitId, input.type, input.period, Date.now()).then((ms) => {
      if (on) setElapsed(ms);
    });
    return () => {
      on = false;
    };
  }, [input.habitId, input.type, input.period, input.targetMinutes, refreshKey]);

  const progress =
    input.targetMinutes > 0 ? Math.min(1, elapsed / (input.targetMinutes * 60_000)) : 0;
  return { elapsedMs: elapsed, progress };
}
