import { db } from '@shared/lib/db/db';
import type { SyncRow } from '@shared/lib/sync/lww';

// Sync uchun xom (snake_case) qator kirishi — local ustunlar remote bilan AYNAN bir xil
// (+ user_id remote'da). Mapper kerak emas. db to'g'ridan (M6 statsRepo patterni — cross-entity import yo'q).
export type RawRow = SyncRow & Record<string, string | number | null>;

const HABIT_COLS = [
  'id', 'name', 'icon', 'color', 'type', 'period',
  'target_minutes', 'sort_order', 'created_at', 'updated_at', 'deleted_at',
] as const;

const SESSION_COLS = [
  'id', 'habit_id', 'duration_ms', 'target_minutes', 'completed', 'away_ms',
  'started_at', 'ended_at', 'created_at', 'updated_at', 'deleted_at',
] as const;

async function listAll(table: 'habits' | 'sessions'): Promise<RawRow[]> {
  const { rows } = await db.execute(`SELECT * FROM ${table};`);
  return (rows ?? []) as unknown as RawRow[];
}

async function upsert(table: 'habits' | 'sessions', cols: readonly string[], rows: RawRow[]): Promise<void> {
  if (rows.length === 0) return;
  const placeholders = `(${cols.map(() => '?').join(', ')})`;
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES ${placeholders};`;
  for (const r of rows) {
    await db.execute(sql, cols.map((c) => r[c] ?? null));
  }
}

export const syncRepo = {
  listAllHabits: () => listAll('habits'),
  listAllSessions: () => listAll('sessions'),
  upsertHabits: (rows: RawRow[]) => upsert('habits', HABIT_COLS, rows),
  upsertSessions: (rows: RawRow[]) => upsert('sessions', SESSION_COLS, rows),
  HABIT_COLS,
  SESSION_COLS,
};
