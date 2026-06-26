import type { HabitPeriod, HabitType } from '@entities/habit';

// Maqsad stepper qadami (DESIGN-SPEC): umrlik 10 soat, davriy 1 soat.
export const TARGET_STEP: Record<HabitType, number> = {
  cumulative: 10,
  recurring: 1,
};

export const DEFAULT_TARGET_HOURS: Record<HabitType, number> = {
  cumulative: 100,
  recurring: 1,
};

export const TYPE_OPTIONS: HabitType[] = ['cumulative', 'recurring'];
export const PERIOD_OPTIONS: HabitPeriod[] = ['daily', 'weekly', 'monthly'];
