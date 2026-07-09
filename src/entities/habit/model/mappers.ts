import type { Habit, HabitColor, HabitPeriod, HabitRow } from './types';

// SQLite qator → Habit entity (snake_case → camelCase, tip cast).
export function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color as HabitColor,
    period: row.period as HabitPeriod,
    targetCount: row.target_count,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? null,
  };
}
