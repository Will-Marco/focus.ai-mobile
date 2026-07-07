create table if not exists public.otp_codes (
  id                 uuid primary key default gen_random_uuid(),
  phone              text not null,
  register_token     text not null unique,
  telegram_chat_id    text,
  telegram_username   text,
  telegram_first_name text,
  verified           boolean not null default false,
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now()
);
create index if not exists idx_otp_phone on public.otp_codes (phone);
create index if not exists idx_otp_chat  on public.otp_codes (telegram_chat_id);

alter table public.otp_codes enable row level security;
-- Policy ataylab yo'q — deny-all (yuqoridagi izohga qarang).
