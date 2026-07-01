import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@shared/api/supabase';
import { sessionRepo, useSessionStore } from '@entities/session';
import { useHabitStore } from '@entities/habit';
import { useProfileStore } from '@entities/profile';
import { GROUP_COLORS, type RoomPresence } from '@entities/group';
import { addDays, startOfDay } from '@shared/lib/time/day';

/** userId'dan barqaror rang (presence avatar). */
function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 9973;
  return GROUP_COLORS[h % GROUP_COLORS.length];
}

/**
 * Guruh xonasidagi jonli presence (Supabase Realtime). Kim hozir online/fokusda —
 * o'z faol sessiyamdan derivatsiya (track), boshqalarникi sync orqali keladi.
 * Sessiya orqa fonда davom etgani uchun (MMKV qaynoq holat) Team ekranida ham fokus ko'rinadi.
 */
export function useRoomPresence(groupId: string | null, userId: string | null): RoomPresence[] {
  const active = useSessionStore((s) => s.active);
  const habits = useHabitStore((s) => s.habits);
  const name = useProfileStore((s) => s.profile?.name) ?? 'Men';
  const [presences, setPresences] = useState<RoomPresence[]>([]);
  const [todayBaseMs, setTodayBaseMs] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fg = active.find((s) => s.isForeground) ?? active[0] ?? null;
  const habitName = fg ? habits.find((h) => h.id === fg.habitId)?.name : undefined;

  // Bugungi YAKUNLANGAN jami fokus (barcha odatlar) — sessiya soni o'zgarganда qayta hisob
  // (sessiya tugab DB'ga yozilganda active kamayadi → recompute). Joriy sessiya bunga qo'shilmaydi.
  useEffect(() => {
    let cancelled = false;
    const from = startOfDay(Date.now());
    sessionRepo
      .sumAllDurationMs(from, addDays(from, 1))
      .then((ms) => {
        if (!cancelled) setTodayBaseMs(ms);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active.length]);

  const myPresence = useMemo<RoomPresence | null>(() => {
    if (!userId) return null;
    return {
      userId,
      name,
      color: colorFromId(userId),
      focusing: !!fg,
      habit: fg ? habitName : undefined,
      accumulatedMs: fg?.accumulatedMs ?? 0,
      runningSince: fg?.runningSince ?? null,
      targetMs: fg ? fg.targetMin * 60000 : undefined,
      todayBaseMs,
    };
  }, [userId, name, fg, habitName, todayBaseMs]);

  const myRef = useRef(myPresence);
  myRef.current = myPresence;

  // Kanalga ulanish (groupId/userId o'zgarganда qayta).
  useEffect(() => {
    const sb = supabase;
    if (!sb || !groupId || !userId) return;
    const channel = sb.channel(`room:${groupId}`, { config: { presence: { key: userId } } });
    channelRef.current = channel;
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<RoomPresence>();
      // Har kalit uchun oxirgi track qilingan holat.
      const list = Object.values(state)
        .map((entries) => entries[entries.length - 1])
        .filter(Boolean) as RoomPresence[];
      setPresences(list);
    });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && myRef.current) channel.track(myRef.current).catch(() => {});
    });
    return () => {
      sb.removeChannel(channel).catch(() => {});
      channelRef.current = null;
      setPresences([]);
    };
  }, [groupId, userId]);

  // O'z holatim o'zgarsa (sessiya boshlandi/tugadi) — qayta track.
  useEffect(() => {
    if (channelRef.current && myPresence) channelRef.current.track(myPresence).catch(() => {});
  }, [myPresence]);

  return presences;
}
