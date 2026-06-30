// Last-Write-Wins (LWW) sync — sof (pure) mantiq. Offline-first: local SQLite manba,
// Supabase server nusxasi bilan `updated_at` + soft-delete (`deleted_at`) orqali birlashtiriladi.

export interface SyncRow {
  id: string;
  /** epoch-ms — eng katta yutadi (LWW). */
  updated_at: number;
  /** soft-delete: o'chirilgan vaqt (epoch-ms) yoki null. */
  deleted_at: number | null;
}

/**
 * Ikki versiya orasidan g'olib (LWW): kattaroq `updated_at`.
 * Teng bo'lsa — `b` (kelgan/remote) ustun, deterministik konvergensiya uchun.
 */
export function winner<T extends SyncRow>(a: T, b: T): T {
  return a.updated_at > b.updated_at ? a : b;
}

/**
 * Push uchun: oxirgi sync'dan keyin o'zgargan local qatorlar (`updated_at > since`).
 * Soft-delete ham push qilinadi (deleted_at to'ldirilgan qator ham o'zgargan hisoblanadi).
 */
export function selectDirty<T extends SyncRow>(rows: T[], since: number): T[] {
  return rows.filter((r) => r.updated_at > since);
}

/**
 * Pull uchun: kelgan (remote) qatorlarni local bilan birlashtirib, local'ga
 * yozilishi kerak bo'lganlarini qaytaradi. Local'da yo'q yoki remote yangiroq
 * bo'lsa — remote yoziladi; local yangiroq bo'lsa — o'tkazib yuboriladi.
 */
export function resolvePull<T extends SyncRow>(localRows: T[], remoteRows: T[]): T[] {
  const localById = new Map(localRows.map((r) => [r.id, r]));
  const toApply: T[] = [];
  for (const remote of remoteRows) {
    const local = localById.get(remote.id);
    if (!local || winner(local, remote) === remote) {
      toApply.push(remote);
    }
  }
  return toApply;
}

/** Qatorlar to'plamidagi eng katta `updated_at` (yangi sync kursori). 0 — bo'sh. */
export function maxUpdatedAt(rows: SyncRow[]): number {
  let max = 0;
  for (const r of rows) if (r.updated_at > max) max = r.updated_at;
  return max;
}
