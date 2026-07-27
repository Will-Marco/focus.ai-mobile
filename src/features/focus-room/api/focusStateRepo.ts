import { supabase } from '@shared/api/supabase';
import type { RoomPresence } from '@entities/group';
import { colorFromId } from '../lib/roomState';

/** Serverga yoziladigan jonli fokus holati (bitta oldingi-plan sessiya). */
export interface FocusStatePayload {
  displayName: string;
  habit?: string;
  accumulatedMs: number;
  runningSince: number | null;
  targetMs?: number;
  todayBaseMs: number;
}

const toPresence = (r: Record<string, unknown>): RoomPresence => ({
  userId: r.user_id as string,
  name: (r.display_name as string) || 'Men',
  color: colorFromId(r.user_id as string),
  focusing: true, // jadvalда qator bor = fokusda
  habit: (r.habit as string) ?? undefined,
  accumulatedMs: Number(r.accumulated_ms ?? 0),
  runningSince: r.running_since === null || r.running_since === undefined ? null : Number(r.running_since),
  targetMs: r.target_ms === null || r.target_ms === undefined ? undefined : Number(r.target_ms),
  todayBaseMs: Number(r.today_base_ms ?? 0),
});

/**
 * Fokus holati serverда (`focus_states`) — presence'дан farqli o'laroq ilova
 * yopilsa ham saqlanadi, shuning uchun guruhdoshlar "kim hozir fokusda" ni
 * har doim ko'radi (FR-9.5). Sessiya tugaganда qator o'chiriladi.
 */
export const focusStateRepo = {
  async publish(state: FocusStatePayload): Promise<void> {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    const { error } = await supabase.from('focus_states').upsert(
      {
        user_id: uid,
        display_name: state.displayName || 'Men',
        habit: state.habit ?? null,
        accumulated_ms: state.accumulatedMs,
        running_since: state.runningSince,
        target_ms: state.targetMs ?? null,
        today_base_ms: state.todayBaseMs,
        updated_at: Date.now(),
      },
      { onConflict: 'user_id' },
    );
    if (error && __DEV__) console.warn('[Focus] publish xato:', error.message, error.code);
  },

  async clear(): Promise<void> {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    const { error } = await supabase.from('focus_states').delete().eq('user_id', uid);
    if (error && __DEV__) console.warn('[Focus] clear xato:', error.message, error.code);
  },

  /** Berilgan foydalanuvchilarning fokus holati (RLS baribir faqat guruhdoshlarni beradi). */
  async listFor(userIds: string[]): Promise<RoomPresence[]> {
    if (!supabase || userIds.length === 0) return [];
    const { data, error } = await supabase.from('focus_states').select('*').in('user_id', userIds);
    if (error || !data) {
      if (error && __DEV__) console.warn('[Focus] listFor xato:', error.message, error.code);
      return [];
    }
    return data.map(toPresence);
  },
};
