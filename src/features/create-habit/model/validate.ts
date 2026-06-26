import type { HabitColor, HabitDraft, HabitPeriod, HabitType } from '@entities/habit';

// Odat yaratish form holati (UI kirritmasi). Target SOATda kiritiladi (DESIGN-SPEC stepper).
export interface HabitFormInput {
  name: string;
  icon: string;
  color: string;
  type: HabitType;
  period: HabitPeriod | null;
  targetHours: number;
}

export interface HabitFormErrors {
  name?: string;
  targetHours?: string;
  period?: string;
}

export type ValidationResult =
  | { ok: true; draft: HabitDraft }
  | { ok: false; errors: HabitFormErrors };

export const NAME_MAX = 50;
export const TARGET_MIN_HOURS = 0.1;
export const TARGET_MAX_HOURS = 1000;

// Pure: form kirritmasini tekshiradi va tozalangan HabitDraft qaytaradi.
export function validateHabitDraft(input: HabitFormInput): ValidationResult {
  const errors: HabitFormErrors = {};
  const name = input.name.trim();

  if (name.length === 0) errors.name = 'empty';
  else if (name.length > NAME_MAX) errors.name = 'tooLong';

  if (input.targetHours < TARGET_MIN_HOURS) errors.targetHours = 'tooSmall';
  else if (input.targetHours > TARGET_MAX_HOURS) errors.targetHours = 'tooLarge';

  const isRecurring = input.type === 'recurring';
  if (isRecurring && input.period === null) errors.period = 'required';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    draft: {
      name,
      icon: input.icon,
      color: input.color as HabitColor,
      type: input.type,
      // cumulative odat hech qachon period saqlamaydi (model toza).
      period: isRecurring ? input.period : null,
      targetMinutes: Math.round(input.targetHours * 60),
    },
  };
}
