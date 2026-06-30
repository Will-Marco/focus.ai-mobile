import { db } from '@shared/lib/db/db';
import { uuid } from '@shared/lib/id';
import { rowToCompletedSession } from '../model/mappers';
import type { CompletedSession, SessionRow } from '../model/types';

export interface SessionDraft {
  habitId: string;
  durationMs: number;
  targetMinutes: number;
  completed: boolean;
  /** telefonsiz (Away) davomiyligi ms — XP 2× bonus (M6). Default 0. */
  awayMs?: number;
  startedAt: number;
  endedAt: number;
}

// Yakunlangan sessiyalar doimiy manba (SQLite). Faqat I/O.
export const sessionRepo = {
  async insert(draft: SessionDraft): Promise<CompletedSession> {
    const now = Date.now();
    const session: CompletedSession = {
      id: uuid(),
      ...draft,
      awayMs: draft.awayMs ?? 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await db.execute(
      `INSERT INTO sessions
         (id, habit_id, duration_ms, target_minutes, completed, away_ms, started_at, ended_at, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
      [
        session.id,
        session.habitId,
        session.durationMs,
        session.targetMinutes,
        session.completed ? 1 : 0,
        session.awayMs,
        session.startedAt,
        session.endedAt,
        session.createdAt,
        session.updatedAt,
      ],
    );
    return session;
  },

  async listByHabit(habitId: string): Promise<CompletedSession[]> {
    const { rows } = await db.execute(
      `SELECT * FROM sessions
       WHERE habit_id = ? AND deleted_at IS NULL
       ORDER BY started_at DESC;`,
      [habitId],
    );
    return (rows ?? []).map((r) => rowToCompletedSession(r as unknown as SessionRow));
  },

  // Davr oynasi ichida (joriy kun/hafta/oy) odat bo'yicha to'plangan vaqt —
  // progress = sumDurationMs / (targetMinutes*60000). [fromTs, toTs).
  async sumDurationMs(habitId: string, fromTs: number, toTs: number): Promise<number> {
    const { rows } = await db.execute(
      `SELECT COALESCE(SUM(duration_ms), 0) AS total FROM sessions
       WHERE habit_id = ? AND deleted_at IS NULL
         AND started_at >= ? AND started_at < ?;`,
      [habitId, fromTs, toTs],
    );
    return Number((rows?.[0] as { total?: number } | undefined)?.total ?? 0);
  },

  // Barcha odatlar bo'yicha oraliqdagi jami vaqt (dashboard "bugungi fokus").
  async sumAllDurationMs(fromTs: number, toTs: number): Promise<number> {
    const { rows } = await db.execute(
      `SELECT COALESCE(SUM(duration_ms), 0) AS total FROM sessions
       WHERE deleted_at IS NULL AND started_at >= ? AND started_at < ?;`,
      [fromTs, toTs],
    );
    return Number((rows?.[0] as { total?: number } | undefined)?.total ?? 0);
  },
};
