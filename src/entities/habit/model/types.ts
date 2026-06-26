export type HabitType = 'cumulative' | 'recurring';
export type HabitPeriod = 'daily' | 'weekly' | 'monthly';

// Habit rang kalitlari (DESIGN-SPEC: Ember habit palette).
export type HabitColor = 'amber' | 'gold' | 'coral' | 'teal' | 'purple';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: HabitColor;
  type: HabitType;
  /** recurring uchun davr; cumulative (umrlik) uchun null. */
  period: HabitPeriod | null;
  /** maqsad daqiqada (targetHours * 60) — butun aniqlik. */
  targetMinutes: number;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

// Odat yaratish uchun foydalanuvchi kiritmasi (UI → repo).
export interface HabitDraft {
  name: string;
  icon: string;
  color: HabitColor;
  type: HabitType;
  period: HabitPeriod | null;
  targetMinutes: number;
}

// SQLite qator shakli (snake_case, integer/null).
export interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  period: string | null;
  target_minutes: number;
  sort_order: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}
