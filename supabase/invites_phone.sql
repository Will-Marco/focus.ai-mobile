-- Focus AI — takliflarni EMAIL dan TELEFON ga o'tkazish (M9 × M12 nomuvofiqligini yopadi).
-- Supabase SQL Editor'da `groups.sql` dan KEYIN ishga tushiring. Idempotent — qayta ishlatsa bo'ladi.
--
-- NEGA: M9 (Team) taklif oqimi email'ga qurilgan edi, lekin M12'да auth telefon +
-- Telegram OTP ga o'tdi va `register-complete` `admin.createUser({ phone })` bilan
-- foydalanuvchi yaratadi — **email bermaydi**. Natijada `auth.users.email` NULL,
-- JWT'да `email` claim yo'q → RLS `invitee_email = auth.jwt()->>'email'` hech qachon
-- mos kelmaydi va taklif oqimi butunlay o'lik edi.
--
-- Format masalasi: Supabase `auth.users.phone` ni "+" belgisiz saqlaydi, mijoz esa
-- `+998…` bilan normallashtiradi. Formatga tayanmaslik uchun **faqat raqamlar**
-- (digits-only) solishtiriladi — ikkala tomonda ham.

-- 1) Ustun + indeks. Eski email ustuni saqlanadi (tarixiy yozuvlar), lekin endi majburiy emas.
alter table public.invites add column if not exists invitee_phone text;
alter table public.invites alter column invitee_email drop not null;
create index if not exists idx_inv_phone on public.invites (invitee_phone, status);

-- 2) Joriy foydalanuvchining telefoni — faqat raqamlar.
--
--    ⚠️ JWT claim'ga TAYANMAYMIZ. `auth.jwt() ->> 'phone'` loyihaning JWT sozlamalari
--    va Supabase versiyasiga qarab bo'sh bo'lishi mumkin; bunda RLS jimgina hech
--    nima qaytarmaydi va taklif "kelmaydi". Shuning uchun manba — `auth.users.phone`
--    (SECURITY DEFINER kerak: oddiy foydalanuvchi `auth` sxemasini o'qiy olmaydi).
create or replace function public.my_phone_digits()
returns text language sql stable security definer set search_path = public, auth as $$
  select regexp_replace(coalesce((select u.phone from auth.users u where u.id = auth.uid()), ''), '\D', '', 'g');
$$;
revoke all on function public.my_phone_digits() from public;
grant execute on function public.my_phone_digits() to authenticated;

-- Eski (JWT'ga tayangan) variant endi ishlatilmaydi.
drop function if exists public.jwt_phone_digits();

-- 3) RLS: taklifni yuborgan VA (telefoni mos kelgan) qabul qiluvchi ko'radi.
--    `invitee_phone <> ''` sharti muhim: telefonsiz foydalanuvchida my_phone_digits()
--    bo'sh satr qaytadi va u bo'sh yozuvlarga mos kelib qolmasligi kerak.
drop policy if exists "inv_select" on public.invites;
create policy "inv_select" on public.invites for select using (
  inviter_id = auth.uid()
  or (coalesce(invitee_phone, '') <> '' and invitee_phone = public.my_phone_digits())
);

drop policy if exists "inv_update" on public.invites;
create policy "inv_update" on public.invites for update using (
  inviter_id = auth.uid()
  or (coalesce(invitee_phone, '') <> '' and invitee_phone = public.my_phone_digits())
);

-- inv_insert o'zgarmaydi: taklifni faqat guruh a'zosi o'z nomidan yaratadi.

-- 4) Realtime: invites allaqachon publication'да (groups.sql). Agar xato bersa — normal.
--    alter publication supabase_realtime add table public.invites;

-- ── Tekshiruv (ixtiyoriy) ──
-- Ilova ichidan chaqirilganда o'z raqamingizni qaytarishi kerak:
--   select public.my_phone_digits();
-- SQL Editor'da (u yerda auth.uid() NULL) bo'sh satr qaytadi — bu normal.
