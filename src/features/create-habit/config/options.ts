import type { HabitPeriod } from '@entities/habit';

export const PERIOD_OPTIONS: HabitPeriod[] = ['daily', 'weekly', 'monthly'];

export interface CountBounds {
  min: number;
  default: number;
  max: number;
}

// Davrga qarab "necha marta" chegaralari (2026-07-08 grill qarori).
export const TARGET_COUNT_BOUNDS: Record<HabitPeriod, CountBounds> = {
  daily: { min: 1, default: 1, max: 5 },
  weekly: { min: 1, default: 3, max: 14 },
  monthly: { min: 1, default: 8, max: 60 },
};
