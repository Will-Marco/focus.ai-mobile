import { useCallback, useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@shared/api/supabase';
import type { GroupMember, RoomPresence } from '@entities/group';
import { focusStateRepo } from '../api/focusStateRepo';

/**
 * Guruh a'zolarining serverдаги fokus holati + jonli yangilanish.
 * Presence'дан farqi: bu ma'lumot foydalanuvchi qaysi ekranда ekaniga (hatto
 * ilova ochiqligiga) bog'liq emas.
 */
export function useRoomFocusStates(members: GroupMember[]): RoomPresence[] {
  const [states, setStates] = useState<RoomPresence[]>([]);
  const ids = members.map((m) => m.userId).join(',');

  const reload = useCallback(async () => {
    const userIds = ids ? ids.split(',') : [];
    if (userIds.length === 0) {
      setStates([]);
      return;
    }
    setStates(await focusStateRepo.listFor(userIds));
  }, [ids]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  // Realtime: RLS tufayli faqat guruhdoshlarim o'zgarishlari keladi.
  // Har o'zgarishда to'liq qayta o'qiymiz — ro'yxat kichik (bir guruh a'zolari).
  useEffect(() => {
    const sb = supabase;
    if (!sb || !ids) return;
    let channel: RealtimeChannel | null = sb
      .channel(`focus:${ids.slice(0, 40)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'focus_states' }, () => {
        reload().catch(() => {});
      })
      .subscribe((status) => {
        if (__DEV__) console.warn(`[Focus] kanal: ${status}`);
      });
    return () => {
      if (channel) sb.removeChannel(channel).catch(() => {});
      channel = null;
    };
  }, [ids, reload]);

  return states;
}
