import type { Habit, HabitColor, HabitPeriod, HabitRow, HabitType } from './types';

// SQLite qator → Habit entity (snake_case → camelCase, tip cast).
export function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color as HabitColor,
    type: row.type as HabitType,
    period: (row.period as HabitPeriod | null) ?? null,
    targetMinutes: row.target_minutes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? null,
  };
}
