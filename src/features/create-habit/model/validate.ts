import type { HabitColor, HabitDraft, HabitPeriod } from '@entities/habit';
import { TARGET_COUNT_BOUNDS } from '../config/options';

// Odat yaratish form holati (UI kirritmasi).
export interface HabitFormInput {
  name: string;
  icon: string;
  color: string;
  period: HabitPeriod;
  targetCount: number;
}

export interface HabitFormErrors {
  name?: string;
  targetCount?: string;
}

export type ValidationResult =
  | { ok: true; draft: HabitDraft }
  | { ok: false; errors: HabitFormErrors };

export const NAME_MAX = 50;

// Pure: form kirritmasini tekshiradi va tozalangan HabitDraft qaytaradi.
export function validateHabitDraft(input: HabitFormInput): ValidationResult {
  const errors: HabitFormErrors = {};
  const name = input.name.trim();

  if (name.length === 0) errors.name = 'empty';
  else if (name.length > NAME_MAX) errors.name = 'tooLong';

  const bounds = TARGET_COUNT_BOUNDS[input.period];
  if (!Number.isInteger(input.targetCount) || input.targetCount < bounds.min) {
    errors.targetCount = 'tooSmall';
  } else if (input.targetCount > bounds.max) {
    errors.targetCount = 'tooLarge';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    draft: {
      name,
      icon: input.icon,
      color: input.color as HabitColor,
      period: input.period,
      targetCount: input.targetCount,
    },
  };
}
