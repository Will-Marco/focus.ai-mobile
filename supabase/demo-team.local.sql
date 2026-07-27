-- Focus AI — demo JAMOA ma'lumoti (Focus Rooms hakam/App Review uchun jonli ko'rinsin).
--
-- NEGA: guruh ro'yxati, feed va "hozir fokusda" bo'limi haqiqiy foydalanuvchilar
-- faolligiga tayanadi — bo'sh akkauntда Jamoa ekrani jonsiz ko'rinadi.
--
-- Takroran ishga tushirsa bo'ladi: demo guruhlar id bo'yicha qayta yoziladi.
-- ⚠️ `focus_states` "hozir fokusda" ni ko'rsatadi — u NISBIY vaqtga bog'liq,
--    shuning uchun skrinshot/video oldidan shu faylni qayta ishga tushiring.

begin;

-- Ishtirokchilar (mavjud auth.users — yangi hisob yaratilmaydi)
--   105f72be…  demo egasi (owner) — profil ismi ilovada "Demo", shuning uchun display_name ham shunday
--   2821f574…  ikkinchi real qurilma
--   a063774e…, 13b6fa09…  eski hisoblar — demo a'zolar sifatida

-- ── Eski test guruhlari (Test / Test 2 / Test 3 / Tets / Irons) ──
delete from public.groups
where name in ('Test', 'Test 2', 'Test 3', 'Tets', 'Irons');
-- group_members / group_activity / invites — cascade bilan o'chadi.

-- ── Demo guruhlar ──
delete from public.groups where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
);

insert into public.groups (id, name, color, owner_id, created_at, updated_at) values
('11111111-1111-4111-8111-111111111111', 'Ertalabki fokus', '#F2A24C',
 '105f72be-06b5-4056-a379-d12d58a777cd',
 (extract(epoch from now() - interval '32 days') * 1000)::bigint,
 (extract(epoch from now()) * 1000)::bigint),
('22222222-2222-4222-8222-222222222222', 'Imtihonga tayyorgarlik', '#5FD0C5',
 '105f72be-06b5-4056-a379-d12d58a777cd',
 (extract(epoch from now() - interval '11 days') * 1000)::bigint,
 (extract(epoch from now()) * 1000)::bigint);

insert into public.group_members (group_id, user_id, display_name, color, role, joined_at) values
-- Ertalabki fokus — 4 a'zo
('11111111-1111-4111-8111-111111111111', '105f72be-06b5-4056-a379-d12d58a777cd', 'Demo',    '#F2603E', 'owner',  (extract(epoch from now() - interval '32 days') * 1000)::bigint),
('11111111-1111-4111-8111-111111111111', '2821f574-c320-4f69-85f5-83cc946d928f', 'Dilnoza', '#9A8CF0', 'member', (extract(epoch from now() - interval '30 days') * 1000)::bigint),
('11111111-1111-4111-8111-111111111111', 'a063774e-f26e-49ab-bb64-8ca532de13b3', 'Sardor',  '#5FD0C5', 'member', (extract(epoch from now() - interval '24 days') * 1000)::bigint),
('11111111-1111-4111-8111-111111111111', '13b6fa09-1420-4c74-b851-70c382517ef7', 'Nilufar', '#F2C879', 'member', (extract(epoch from now() - interval '9 days') * 1000)::bigint),
-- Imtihonga tayyorgarlik — 3 a'zo
('22222222-2222-4222-8222-222222222222', '105f72be-06b5-4056-a379-d12d58a777cd', 'Demo',    '#F2603E', 'owner',  (extract(epoch from now() - interval '11 days') * 1000)::bigint),
('22222222-2222-4222-8222-222222222222', '2821f574-c320-4f69-85f5-83cc946d928f', 'Dilnoza', '#9A8CF0', 'member', (extract(epoch from now() - interval '10 days') * 1000)::bigint),
('22222222-2222-4222-8222-222222222222', 'a063774e-f26e-49ab-bb64-8ca532de13b3', 'Sardor',  '#5FD0C5', 'member', (extract(epoch from now() - interval '6 days') * 1000)::bigint);

-- ── Feed (eng yangisi tepada ko'rinadi) ──
insert into public.group_activity (group_id, user_id, type, text, color, created_at) values
('11111111-1111-4111-8111-111111111111', '13b6fa09-1420-4c74-b851-70c382517ef7', 'completed', 'Nilufar Meditatsiya sessiyasini yakunladi', '#F2C879', (extract(epoch from now() - interval '42 minutes') * 1000)::bigint),
('11111111-1111-4111-8111-111111111111', '2821f574-c320-4f69-85f5-83cc946d928f', 'completed', 'Dilnoza Ingliz tili sessiyasini yakunladi',  '#9A8CF0', (extract(epoch from now() - interval '3 hours') * 1000)::bigint),
('11111111-1111-4111-8111-111111111111', '105f72be-06b5-4056-a379-d12d58a777cd', 'completed', 'Demo Mutolaa sessiyasini yakunladi',       '#F2603E', (extract(epoch from now() - interval '5 hours') * 1000)::bigint),
('11111111-1111-4111-8111-111111111111', 'a063774e-f26e-49ab-bb64-8ca532de13b3', 'completed', 'Sardor Sport sessiyasini yakunladi',         '#5FD0C5', (extract(epoch from now() - interval '26 hours') * 1000)::bigint),
('11111111-1111-4111-8111-111111111111', '13b6fa09-1420-4c74-b851-70c382517ef7', 'joined',    'Nilufar guruhga qo''shildi',                 '#F2C879', (extract(epoch from now() - interval '9 days') * 1000)::bigint),
('22222222-2222-4222-8222-222222222222', 'a063774e-f26e-49ab-bb64-8ca532de13b3', 'completed', 'Sardor Loyiha ustida ish sessiyasini yakunladi', '#5FD0C5', (extract(epoch from now() - interval '88 minutes') * 1000)::bigint),
('22222222-2222-4222-8222-222222222222', '2821f574-c320-4f69-85f5-83cc946d928f', 'completed', 'Dilnoza Mutolaa sessiyasini yakunladi',      '#9A8CF0', (extract(epoch from now() - interval '7 hours') * 1000)::bigint),
('22222222-2222-4222-8222-222222222222', 'a063774e-f26e-49ab-bb64-8ca532de13b3', 'joined',    'Sardor guruhga qo''shildi',                  '#5FD0C5', (extract(epoch from now() - interval '6 days') * 1000)::bigint);

-- ── "Hozir fokusda" (jonli) ──
-- Sardor: 18 daqiqadan beri fokusda · Nilufar: pauzada (runningSince null).
-- Sir'ning ikki real akkaunti tegilmaydi — ular o'z sessiyalarini o'zi boshqaradi.
delete from public.focus_states where user_id in (
  'a063774e-f26e-49ab-bb64-8ca532de13b3',
  '13b6fa09-1420-4c74-b851-70c382517ef7'
);
insert into public.focus_states
  (user_id, display_name, habit, accumulated_ms, running_since, target_ms, today_base_ms, updated_at) values
('a063774e-f26e-49ab-bb64-8ca532de13b3', 'Sardor',  'Loyiha ustida ish', 0,
 (extract(epoch from now() - interval '18 minutes') * 1000)::bigint, 2700000, 1920000,
 (extract(epoch from now()) * 1000)::bigint),
('13b6fa09-1420-4c74-b851-70c382517ef7', 'Nilufar', 'Mutolaa', 660000,
 null, 1500000, 2820000,
 (extract(epoch from now()) * 1000)::bigint);

commit;
