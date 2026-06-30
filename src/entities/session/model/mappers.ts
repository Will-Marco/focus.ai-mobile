import type { CompletedSession, SessionRow } from './types';

// SQLite qator → CompletedSession (snake_case → camelCase, 0/1 → boolean).
export function rowToCompletedSession(row: SessionRow): CompletedSession {
  return {
    id: row.id,
    habitId: row.habit_id,
    durationMs: row.duration_ms,
    targetMinutes: row.target_minutes,
    completed: row.completed === 1,
    awayMs: row.away_ms ?? 0,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? null,
  };
}
