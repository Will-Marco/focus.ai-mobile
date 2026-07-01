-- Focus AI — M9 Team / Focus Rooms schema + RLS.
-- Supabase SQL Editor'da M8 schema.sql'dan KEYIN ishga tushiring.
-- Jonli presence Realtime kanal orqali (jadval kerak emas); bu yerda guruh/a'zo/taklif/feed.

-- ───────────────────────── groups ─────────────────────────
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text not null default '#F2A24C',
  owner_id    uuid not null references auth.users (id) on delete cascade,
  created_at  bigint not null,
  updated_at  bigint not null
);

-- ─────────────────────── group_members ────────────────────
create table if not exists public.group_members (
  group_id      uuid not null references public.groups (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  display_name  text not null,
  color         text not null default '#F2603E',
  role          text not null default 'member' check (role in ('owner','member')),
  joined_at     bigint not null,
  primary key (group_id, user_id)
);
create index if not exists idx_gm_user on public.group_members (user_id);

-- ────────────────────────── invites ───────────────────────
create table if not exists public.invites (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null references public.groups (id) on delete cascade,
  inviter_id     uuid not null references auth.users (id) on delete cascade,
  invitee_email  text not null,
  status         text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at     bigint not null
);
create index if not exists idx_inv_email on public.invites (lower(invitee_email), status);
create index if not exists idx_inv_group on public.invites (group_id);

-- ──────────────────── group_activity (feed) ───────────────
create table if not exists public.group_activity (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  type        text not null check (type in ('started','completed','joined')),
  text        text not null,
  color       text not null default '#F2A24C',
  created_at  bigint not null
);
create index if not exists idx_act_group on public.group_activity (group_id, created_at desc);

-- ─────── a'zolik tekshiruvi (RLS rekursiyasini oldini olish uchun SECURITY DEFINER) ───────
create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid());
$$;

-- ────────────────────────── RLS ───────────────────────────
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.invites        enable row level security;
alter table public.group_activity enable row level security;

-- groups: a'zo ko'radi; authenticated yaratadi (o'zi owner); owner yangilaydi/o'chiradi.
drop policy if exists "groups_select" on public.groups;
create policy "groups_select" on public.groups for select using (public.is_group_member(id) or owner_id = auth.uid());
drop policy if exists "groups_insert" on public.groups;
create policy "groups_insert" on public.groups for insert with check (owner_id = auth.uid());
drop policy if exists "groups_modify" on public.groups;
create policy "groups_modify" on public.groups for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "groups_delete" on public.groups;
create policy "groups_delete" on public.groups for delete using (owner_id = auth.uid());

-- group_members: guruh a'zolari bir-birini ko'radi; foydalanuvchi o'zini qo'shadi/o'chiradi.
drop policy if exists "gm_select" on public.group_members;
create policy "gm_select" on public.group_members for select using (public.is_group_member(group_id));
drop policy if exists "gm_insert_self" on public.group_members;
create policy "gm_insert_self" on public.group_members for insert with check (user_id = auth.uid());
drop policy if exists "gm_delete_self" on public.group_members;
create policy "gm_delete_self" on public.group_members for delete using (user_id = auth.uid());

-- invites: taklif qiluvchi va (email bo'yicha) qabul qiluvchi ko'radi; a'zo taklif yaratadi.
drop policy if exists "inv_select" on public.invites;
create policy "inv_select" on public.invites for select using (
  inviter_id = auth.uid()
  or lower(invitee_email) = lower((auth.jwt() ->> 'email'))
);
drop policy if exists "inv_insert" on public.invites;
create policy "inv_insert" on public.invites for insert with check (inviter_id = auth.uid() and public.is_group_member(group_id));
drop policy if exists "inv_update" on public.invites;
create policy "inv_update" on public.invites for update using (
  lower(invitee_email) = lower((auth.jwt() ->> 'email')) or inviter_id = auth.uid()
);

-- group_activity: a'zolar feedni ko'radi; a'zo o'z faoliyatini yozadi.
drop policy if exists "act_select" on public.group_activity;
create policy "act_select" on public.group_activity for select using (public.is_group_member(group_id));
drop policy if exists "act_insert" on public.group_activity;
create policy "act_insert" on public.group_activity for insert with check (user_id = auth.uid() and public.is_group_member(group_id));

-- Realtime: presence kanal + activity/invites jadvallarini publication'ga qo'shish.
-- (feed live + taklif live). Agar allaqachon qo'shilган bo'lsa xatoni e'tiborsiz qoldiring.
alter publication supabase_realtime add table public.group_activity;
alter publication supabase_realtime add table public.invites;
