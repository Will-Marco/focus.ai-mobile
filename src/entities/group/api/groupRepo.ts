import { supabase } from '@shared/api/supabase';
import type { Group, GroupActivity, GroupMember, GroupSummary, Invite } from '../model/types';

// Online manba — Supabase. Hammasi guard: client/sessiya yo'q bo'lsa bo'sh/null.
async function currentUser(): Promise<{ id: string; email: string } | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  return u ? { id: u.id, email: u.email ?? '' } : null;
}

// ── Mapperlar (snake_case → domen) ──
const toGroup = (r: Record<string, unknown>): Group => ({
  id: r.id as string,
  name: r.name as string,
  color: r.color as string,
  ownerId: r.owner_id as string,
  createdAt: Number(r.created_at),
  updatedAt: Number(r.updated_at),
});
const toMember = (r: Record<string, unknown>): GroupMember => ({
  groupId: r.group_id as string,
  userId: r.user_id as string,
  displayName: r.display_name as string,
  color: r.color as string,
  role: r.role as GroupMember['role'],
  joinedAt: Number(r.joined_at),
});
const toActivity = (r: Record<string, unknown>): GroupActivity => ({
  id: r.id as string,
  groupId: r.group_id as string,
  userId: r.user_id as string,
  type: r.type as GroupActivity['type'],
  text: r.text as string,
  color: r.color as string,
  createdAt: Number(r.created_at),
});

export const groupRepo = {
  async listMyGroups(): Promise<GroupSummary[]> {
    if (!supabase) return [];
    const me = await currentUser();
    if (!me) return [];
    // Men a'zo bo'lgan guruhlar (group_members → groups).
    const { data, error } = await supabase
      .from('group_members')
      .select('groups(*), group_id')
      .eq('user_id', me.id);
    if (error || !data) return [];
    // PostgREST embed turini generatsiya qilingan tiplar yo'qligida bo'sh biladi — array yoki obyekt.
    const groups = data
      .map((r) => (r as unknown as { groups?: Record<string, unknown> | Record<string, unknown>[] }).groups)
      .flatMap((g) => (Array.isArray(g) ? g : g ? [g] : []))
      .map(toGroup);
    // A'zolar soni (har guruh uchun bitta count so'rovi — kichik N).
    const summaries = await Promise.all(
      groups.map(async (g): Promise<GroupSummary> => {
        const { count } = await supabase!
          .from('group_members')
          .select('user_id', { count: 'exact', head: true })
          .eq('group_id', g.id);
        return { ...g, memberCount: count ?? 1 };
      }),
    );
    return summaries;
  },

  async createGroup(name: string, color: string): Promise<Group | null> {
    if (!supabase) {
      if (__DEV__) console.warn('[Group] createGroup: Supabase sozlanmagan');
      return null;
    }
    const me = await currentUser();
    if (!me) {
      if (__DEV__) console.warn('[Group] createGroup: SESSIYA YO\'Q (Confirm email yoqilgan? Google bilan kiring)');
      return null;
    }
    const now = Date.now();
    const { data, error } = await supabase
      .from('groups')
      .insert({ name, color, owner_id: me.id, created_at: now, updated_at: now })
      .select()
      .single();
    if (error || !data) {
      if (__DEV__) console.warn('[Group] createGroup insert xato:', error?.message, error?.code);
      return null;
    }
    const group = toGroup(data);
    // Yaratuvchi avtomatik owner a'zo.
    const { error: memErr } = await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: me.id,
      display_name: me.email.split('@')[0] || 'Men',
      color,
      role: 'owner',
      joined_at: now,
    });
    if (memErr && __DEV__) console.warn('[Group] createGroup member insert xato:', memErr.message, memErr.code);
    return group;
  },

  async listMembers(groupId: string): Promise<GroupMember[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('group_members').select('*').eq('group_id', groupId);
    if (error || !data) return [];
    return data.map(toMember);
  },

  async leaveGroup(groupId: string): Promise<void> {
    const me = await currentUser();
    if (!supabase || !me) return;
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', me.id);
  },

  // ── Takliflar ──
  async createInvite(groupId: string, email: string): Promise<boolean> {
    const me = await currentUser();
    if (!supabase || !me) return false;
    const { error } = await supabase.from('invites').insert({
      group_id: groupId,
      inviter_id: me.id,
      invitee_email: email.trim().toLowerCase(),
      status: 'pending',
      created_at: Date.now(),
    });
    return !error;
  },

  async listMyInvites(): Promise<Invite[]> {
    if (!supabase) return [];
    const me = await currentUser();
    if (!me || !me.email) return [];
    const { data, error } = await supabase
      .from('invites')
      .select('*, groups(name)')
      .eq('invitee_email', me.email.toLowerCase())
      .eq('status', 'pending');
    if (error || !data) return [];
    return data.map((r) => {
      const row = r as Record<string, unknown> & { groups?: { name?: string } };
      return {
        id: row.id as string,
        groupId: row.group_id as string,
        inviterId: row.inviter_id as string,
        inviteeEmail: row.invitee_email as string,
        status: row.status as Invite['status'],
        createdAt: Number(row.created_at),
        groupName: row.groups?.name,
      };
    });
  },

  async respondInvite(invite: Invite, accept: boolean): Promise<boolean> {
    const me = await currentUser();
    if (!supabase || !me) return false;
    const status = accept ? 'accepted' : 'rejected';
    const { error } = await supabase.from('invites').update({ status }).eq('id', invite.id);
    if (error) return false;
    if (accept) {
      await supabase.from('group_members').insert({
        group_id: invite.groupId,
        user_id: me.id,
        display_name: me.email.split('@')[0] || 'Men',
        color: '#F2603E',
        role: 'member',
        joined_at: Date.now(),
      });
    }
    return true;
  },

  // ── Feed ──
  async listActivity(groupId: string, limit = 20): Promise<GroupActivity[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('group_activity')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(toActivity);
  },

  async addActivity(groupId: string, type: GroupActivity['type'], text: string, color: string): Promise<void> {
    const me = await currentUser();
    if (!supabase || !me) return;
    await supabase.from('group_activity').insert({
      group_id: groupId,
      user_id: me.id,
      type,
      text,
      color,
      created_at: Date.now(),
    });
  },

  // Mening BARCHA guruhlarimga bitta faoliyat (sessiya yakuni) — fire-and-forget.
  async broadcastActivity(type: GroupActivity['type'], text: string, color: string): Promise<void> {
    const me = await currentUser();
    if (!supabase || !me) return;
    const { data } = await supabase.from('group_members').select('group_id').eq('user_id', me.id);
    const ids = (data ?? []).map((r) => (r as { group_id: string }).group_id);
    if (ids.length === 0) return;
    const now = Date.now();
    await supabase.from('group_activity').insert(
      ids.map((gid) => ({ group_id: gid, user_id: me.id, type, text, color, created_at: now })),
    );
  },
};
