import { open } from '@op-engineering/op-sqlite';

// Local SQLite — offline-first manba. App jadvallari (habits/sessions) M2 da qo'shiladi.
export const db = open({ name: 'focusai.db' });

export async function runMigrations(): Promise<void> {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS _migrations (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL UNIQUE,
       applied_at INTEGER NOT NULL
     );`,
  );
}
