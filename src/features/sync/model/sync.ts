import { supabase } from '@shared/api/supabase';
import { maxUpdatedAt, resolvePull, selectDirty } from '@shared/lib/sync/lww';
import { useHabitStore } from '@entities/habit';
import { syncRepo, type RawRow } from '../api/syncRepo';
import { cursor, type CursorKey } from './cursor';

export interface SyncResult {
  ok: boolean;
  pushed: number;
  pulled: number;
  /** muvaffaqiyatsizlik sababi (i18n: sync.reason.*). */
  reason?: 'notConfigured' | 'notAuthed' | 'error';
}

interface TablePlan {
  table: 'habits' | 'sessions';
  pushKey: CursorKey;
  pullKey: CursorKey;
  listAll: () => Promise<RawRow[]>;
  upsertLocal: (rows: RawRow[]) => Promise<void>;
}

const PLANS: TablePlan[] = [
  { table: 'habits', pushKey: 'habits_push', pullKey: 'habits_pull', listAll: syncRepo.listAllHabits, upsertLocal: syncRepo.upsertHabits },
  { table: 'sessions', pushKey: 'sessions_push', pullKey: 'sessions_pull', listAll: syncRepo.listAllSessions, upsertLocal: syncRepo.upsertSessions },
];

/**
 * Offline-first LWW sync: har jadval uchun PUSH (dirty local → remote upsert) +
 * PULL (yangi remote → local merge). Konflikt LWW (updated_at). Soft-delete tarqaladi.
 */
export async function syncAll(): Promise<SyncResult> {
  if (!supabase) return { ok: false, pushed: 0, pulled: 0, reason: 'notConfigured' };

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, pushed: 0, pulled: 0, reason: 'notAuthed' };

  let pushed = 0;
  let pulled = 0;

  try {
    for (const plan of PLANS) {
      const local = await plan.listAll();

      // ── PUSH ── oxirgi push'dan keyin o'zgargan local qatorlar (soft-delete ham).
      const dirty = selectDirty(local, cursor.get(plan.pushKey));
      if (dirty.length > 0) {
        const payload = dirty.map((r) => ({ ...r, user_id: userId }));
        const { error } = await supabase.from(plan.table).upsert(payload);
        if (error) return { ok: false, pushed, pulled, reason: 'error' };
        cursor.set(plan.pushKey, maxUpdatedAt(local));
        pushed += dirty.length;
      }

      // ── PULL ── oxirgi pull'dan keyin o'zgargan remote qatorlar.
      const lastPull = cursor.get(plan.pullKey);
      const { data: remote, error } = await supabase
        .from(plan.table)
        .select('*')
        .gt('updated_at', lastPull);
      if (error) return { ok: false, pushed, pulled, reason: 'error' };

      const remoteRows = (remote ?? []) as unknown as RawRow[];
      const toApply = resolvePull(local, remoteRows);
      if (toApply.length > 0) await plan.upsertLocal(toApply);
      cursor.set(plan.pullKey, Math.max(lastPull, maxUpdatedAt(remoteRows)));
      pulled += toApply.length;
    }
  } catch {
    return { ok: false, pushed, pulled, reason: 'error' };
  }

  // Pull o'zgartirishlarini UI'ga aks ettirish (sessiyalar fokusда qayta o'qiladi).
  if (pulled > 0) await useHabitStore.getState().hydrate();

  return { ok: true, pushed, pulled };
}
