-- Focus AI — Supabase schema + RLS (M8 sync).
-- Supabase Dashboard → SQL Editor'da bir marta ishga tushiring.
-- Offline-first: local SQLite manba; bu yerga LWW (updated_at + soft-delete) bilan sync qilinadi.
-- Vaqtlar epoch-MS (BIGINT) — local SQLite bilan bir xil format.

-- ───────────────────────── habits ─────────────────────────
create table if not exists public.habits (
  id              text primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  icon            text not null,
  color           text not null,
  type            text not null check (type in ('cumulative','recurring')),
  period          text          check (period in ('daily','weekly','monthly')),
  target_minutes  integer not null,
  sort_order      integer not null default 0,
  created_at      bigint not null,
  updated_at      bigint not null,
  deleted_at      bigint
);
create index if not exists idx_habits_user    on public.habits (user_id);
create index if not exists idx_habits_updated on public.habits (user_id, updated_at);

-- ──────────────────────── sessions ────────────────────────
create table if not exists public.sessions (
  id              text primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  habit_id        text not null,
  duration_ms     integer not null,
  target_minutes  integer not null,
  completed       integer not null default 0,
  away_ms         integer not null default 0,
  started_at      bigint not null,
  ended_at        bigint not null,
  created_at      bigint not null,
  updated_at      bigint not null,
  deleted_at      bigint
);
create index if not exists idx_sessions_user    on public.sessions (user_id);
create index if not exists idx_sessions_updated on public.sessions (user_id, updated_at);

-- ────────────────────────── RLS ───────────────────────────
alter table public.habits   enable row level security;
alter table public.sessions enable row level security;

-- Har foydalanuvchi faqat o'z qatorlarini ko'radi/o'zgartiradi.
drop policy if exists "habits_owner" on public.habits;
create policy "habits_owner" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sessions_owner" on public.sessions;
create policy "sessions_owner" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
