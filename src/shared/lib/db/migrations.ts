// Versiyalangan, idempotent migratsiyalar. Har biri bir marta qo'llanadi
// (_migrations jadvalida nom bo'yicha kuzatiladi). Tartib — massiv tartibi.
export interface Migration {
  name: string;
  sql: string;
}

export const migrations: Migration[] = [
  {
    name: '001_init_habits_sessions',
    sql: `
      CREATE TABLE IF NOT EXISTS habits (
        id              TEXT    PRIMARY KEY,
        name            TEXT    NOT NULL,
        icon            TEXT    NOT NULL,
        color           TEXT    NOT NULL,
        type            TEXT    NOT NULL CHECK (type IN ('cumulative','recurring')),
        period          TEXT             CHECK (period IN ('daily','weekly','monthly')),
        target_minutes  INTEGER NOT NULL,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL,
        updated_at      INTEGER NOT NULL,
        deleted_at      INTEGER
      );

      -- Faqat YAKUNLANGAN vaqt yozuvlari (qaror: vaqt manbai = sessions).
      -- Qaynoq running/paused holat MMKV'da; bu yerga finish'da yoziladi.
      CREATE TABLE IF NOT EXISTS sessions (
        id              TEXT    PRIMARY KEY,
        habit_id        TEXT    NOT NULL,
        duration_ms     INTEGER NOT NULL,
        target_minutes  INTEGER NOT NULL,
        completed       INTEGER NOT NULL DEFAULT 0,
        started_at      INTEGER NOT NULL,
        ended_at        INTEGER NOT NULL,
        created_at      INTEGER NOT NULL,
        updated_at      INTEGER NOT NULL,
        deleted_at      INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_habit   ON sessions (habit_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions (started_at);
      CREATE INDEX IF NOT EXISTS idx_habits_deleted   ON habits   (deleted_at);
    `,
  },
];
