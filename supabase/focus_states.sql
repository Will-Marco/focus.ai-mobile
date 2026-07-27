-- Focus AI — jonli fokus holati (FR-9.5) DB orqali.
-- Supabase SQL Editor'da `groups.sql` dan KEYIN ishga tushiring. Idempotent.
--
-- NEGA JADVAL, faqat Realtime Presence emas: presence "kim hozir KANALGA ULANGAN"
-- degani, ya'ni foydalanuvchi guruh ekranidan chiqsa yoki ilovani yopsa — u
-- guruhdoshlari uchun ko'rinmay qoladi. Eng tabiiy holat esa aynan shu:
-- odam sessiyani boshlaydi, telefonni qo'yadi (Away). Shuning uchun fokus holati
-- serverда saqlanadi; presence esa "onlayn" belgisi sifatida qoladi.
--
-- Bitta foydalanuvchi bir vaqtda bitta oldingi-plan sessiyaga ega → user_id = PK.
-- Sessiya tugaganда/bekor qilinganда qator O'CHIRILADI (mavjud = fokusda).

create table if not exists public.focus_states (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  display_name   text not null default 'Men',
  habit          text,
  -- Timer formulasi mijoz bilan bir xil: elapsed = accumulated_ms + (running_since ? now - running_since : 0)
  accumulated_ms bigint not null default 0,
  running_since  bigint,               -- null = pauza
  target_ms      bigint,
  today_base_ms  bigint not null default 0,
  updated_at     bigint not null
);

-- Ikki foydalanuvchi umumiy guruhда bormi. SECURITY DEFINER — RLS ichida
-- group_members'ga to'g'ridan-to'g'ri so'rov rekursiyaga olib kelmasin.
create or replace function public.shares_group_with(other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.group_members a
    join public.group_members b on b.group_id = a.group_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;
revoke all on function public.shares_group_with(uuid) from public;
grant execute on function public.shares_group_with(uuid) to authenticated;

alter table public.focus_states enable row level security;

-- O'z holatini har kim ko'radi/yozadi; boshqalarникini faqat guruhdoshlari ko'radi.
drop policy if exists "fs_select" on public.focus_states;
create policy "fs_select" on public.focus_states for select using (
  user_id = auth.uid() or public.shares_group_with(user_id)
);
drop policy if exists "fs_insert" on public.focus_states;
create policy "fs_insert" on public.focus_states for insert with check (user_id = auth.uid());
drop policy if exists "fs_update" on public.focus_states;
create policy "fs_update" on public.focus_states for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fs_delete" on public.focus_states;
create policy "fs_delete" on public.focus_states for delete using (user_id = auth.uid());

-- Realtime: guruhdoshlarда darhol ko'rinsin (RLS realtime'да ham qo'llanadi).
do $$
begin
  alter publication supabase_realtime add table public.focus_states;
exception
  when duplicate_object then null;  -- allaqachon qo'shilgan
end $$;
