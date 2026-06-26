import { palette } from './palette';

// Habit accent ranglari (DESIGN-SPEC: 5 dumaloq). Key — Habit.color bilan mos.
export const HABIT_COLORS = {
  amber: palette.habitAmber,
  gold: palette.habitGold,
  coral: palette.habitCoral,
  teal: palette.habitTeal,
  purple: palette.habitPurple,
} as const;

export type HabitColorKey = keyof typeof HABIT_COLORS;

export const HABIT_COLOR_KEYS = Object.keys(HABIT_COLORS) as HabitColorKey[];

// Noma'lum key uchun amber fallback (crash yo'q).
export function habitColorHex(key: string): string {
  return HABIT_COLORS[key as HabitColorKey] ?? palette.habitAmber;
}
