export type HabitPeriod = 'daily' | 'weekly' | 'monthly';

// Habit rang kalitlari (DESIGN-SPEC: Ember habit palette).
export type HabitColor = 'amber' | 'gold' | 'coral' | 'teal' | 'purple';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: HabitColor;
  /** davr — majburiy (2026-07-08: "umrlik" turi olib tashlandi). */
  period: HabitPeriod;
  /** joriy davrda necha marta bajarilishi kerak. */
  targetCount: number;
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
  period: HabitPeriod;
  targetCount: number;
}

// SQLite qator shakli (snake_case, integer/null).
export interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  period: string;
  target_count: number;
  sort_order: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}
