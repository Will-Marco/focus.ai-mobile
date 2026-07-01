import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@shared/api/supabase';
import { groupRepo, type GroupActivity, type GroupMember } from '@entities/group';

interface RoomData {
  members: GroupMember[];
  feed: GroupActivity[];
  loading: boolean;
  reload: () => Promise<void>;
}

/** Guruh detali: a'zolar + feed (jonli — group_activity realtime insert'lari prepend). */
export function useGroupRoom(groupId: string | null): RoomData {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [feed, setFeed] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    const [m, f] = await Promise.all([groupRepo.listMembers(groupId), groupRepo.listActivity(groupId)]);
    setMembers(m);
    setFeed(f);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  // Realtime feed — yangi faoliyat kelganда ro'yxat boshiga.
  useEffect(() => {
    const sb = supabase;
    if (!sb || !groupId) return;
    const channel = sb
      .channel(`feed:${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_activity', filter: `group_id=eq.${groupId}` },
        (payload) => {
          const r = payload.new as Record<string, unknown>;
          setFeed((prev) => [
            {
              id: r.id as string,
              groupId: r.group_id as string,
              userId: r.user_id as string,
              type: r.type as GroupActivity['type'],
              text: r.text as string,
              color: r.color as string,
              createdAt: Number(r.created_at),
            },
            ...prev,
          ]);
        },
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel).catch(() => {});
    };
  }, [groupId]);

  return { members, feed, loading, reload };
}
