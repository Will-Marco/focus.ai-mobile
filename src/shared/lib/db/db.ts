import { open } from '@op-engineering/op-sqlite';
import { migrations } from './migrations';

// Local SQLite — offline-first doimiy manba (habits + yakunlangan sessions).
export const db = open({ name: 'focusai.db' });

// Idempotent migratsiya runner: qo'llanmagan migratsiyalarni tartib bilan,
// har birini bitta tranzaksiyada bajaradi va _migrations'ga yozadi.
export async function runMigrations(): Promise<void> {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS _migrations (
       name       TEXT    PRIMARY KEY,
       applied_at INTEGER NOT NULL
     );`,
  );

  const { rows } = await db.execute('SELECT name FROM _migrations;');
  const applied = new Set((rows ?? []).map((r) => r.name as string));

  for (const m of migrations) {
    if (applied.has(m.name)) continue;
    await db.transaction(async (tx) => {
      await tx.execute(m.sql);
      await tx.execute('INSERT INTO _migrations (name, applied_at) VALUES (?, ?);', [
        m.name,
        Date.now(),
      ]);
    });
  }
}
