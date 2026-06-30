import { db } from '@shared/lib/db/db';
import type { SessionStat } from '../model/types';

interface StatRow {
  habit_id: string;
  duration_ms: number;
  target_minutes: number;
  completed: number;
  away_ms: number | null;
  started_at: number;
}

// Statistika o'qish-proeksiyasi (sessions jadvalidan). Faqat I/O.
export const statsRepo = {
  async listSessionStats(): Promise<SessionStat[]> {
    const { rows } = await db.execute(
      `SELECT habit_id, duration_ms, target_minutes, completed, away_ms, started_at
         FROM sessions
        WHERE deleted_at IS NULL
        ORDER BY started_at ASC;`,
    );
    return (rows ?? []).map((r) => {
      const row = r as unknown as StatRow;
      return {
        habitId: row.habit_id,
        durationMs: row.duration_ms,
        targetMinutes: row.target_minutes,
        completed: row.completed === 1,
        awayMs: row.away_ms ?? 0,
        startedAt: row.started_at,
      };
    });
  },
};
