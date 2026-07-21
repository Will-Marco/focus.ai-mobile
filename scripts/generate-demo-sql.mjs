/**
 * Demo akkaunt uchun SQL seed generatori.
 *
 * NEGA: App Review'chi (Apple/Google) demo akkauntga kirganda bo'sh ilova ko'rmasligi
 * kerak — streak, heatmap va statistika o'tgan kunlardagi sessiyalarga tayanadi, ularni
 * qo'lda yaratib bo'lmaydi. Bu skript shu tarixni SQL sifatida chiqaradi; natija
 * Supabase SQL Editor'da bir marta ishga tushiriladi (u yerda RLS chetlab o'tiladi).
 *
 * Deterministik: bir xil seed → bir xil natija.
 *
 *   node scripts/generate-demo-sql.mjs <USER_UUID> [> demo.sql]
 */
import { randomUUID } from 'node:crypto';

const userId = process.argv[2];
if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
  console.error('Xato: foydalanuvchi UUID kerak.\n');
  console.error('  node scripts/generate-demo-sql.mjs 123e4567-e89b-12d3-a456-426614174000');
  process.exit(1);
}

// — Sozlamalar —
const DAYS = 75; // heatmap ~2.5 oyni ko'rsatadi
const STREAK_DAYS = 16; // so'nggi shuncha kun uzluksiz
const SEED = 20260727;
const DAY_MS = 86_400_000;

const HABITS = [
  { name: 'Mutolaa', icon: 'book', color: 'amber', period: 'daily', target: 2, dur: [25, 45] },
  { name: 'Sport', icon: 'dumbbell', color: 'coral', period: 'daily', target: 1, dur: [30, 45] },
  { name: 'Ingliz tili', icon: 'brain', color: 'purple', period: 'daily', target: 1, dur: [15, 25] },
  { name: 'Meditatsiya', icon: 'leaf', color: 'gold', period: 'daily', target: 1, dur: [10, 15] },
  { name: 'Loyiha ustida ish', icon: 'code', color: 'teal', period: 'weekly', target: 5, dur: [45, 60] },
];

/* eslint-disable no-bitwise -- mulberry32 PRNG bit operatsiyalarisiz ishlamaydi */
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* eslint-enable no-bitwise */

const rand = rng(SEED);
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const now = Date.now();
const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);

// — Odatlar —
const habitIds = HABITS.map(() => randomUUID());
const habitRows = HABITS.map((h, i) => {
  const created = now - DAYS * DAY_MS;
  return `(${q(habitIds[i])}, ${q(userId)}, ${q(h.name)}, ${q(h.icon)}, ${q(h.color)}, ${q(h.period)}, ${h.target}, ${created + i}, ${created}, ${now}, null)`;
});

// — Sessiyalar —
const sessionRows = [];
for (let dayBack = DAYS - 1; dayBack >= 0; dayBack--) {
  const dayStart = startOfToday.getTime() - dayBack * DAY_MS;
  const inStreak = dayBack < STREAK_DAYS;

  // Streakdan oldin bo'shliqlar qoladi — heatmap real ishlatilgandek ko'rinsin.
  if (!inStreak && rand() > 0.62) continue;

  const count = inStreak ? 1 + Math.floor(rand() * 3) : 1 + Math.floor(rand() * 2);
  for (let s = 0; s < count; s++) {
    const idx = Math.floor(rand() * HABITS.length);
    const [minM, maxM] = HABITS[idx].dur;
    const targetMinutes = minM + Math.floor(rand() * (maxM - minM + 1));

    const hour = 8 + Math.floor(rand() * 14); // 08:00–22:00
    const startedAt = dayStart + hour * 3_600_000 + Math.floor(rand() * 3_600_000);
    const overtime = rand() > 0.78 ? Math.floor(rand() * 10) : 0;
    const durationMs = (targetMinutes + overtime) * 60_000;
    // Uchdan biri "Away" — 2× XP bonusi statistikada ko'rinsin.
    const awayMs = rand() > 0.66 ? Math.floor(durationMs * (0.3 + rand() * 0.5)) : 0;

    sessionRows.push(
      `(${q(randomUUID())}, ${q(userId)}, ${q(habitIds[idx])}, ${durationMs}, ${targetMinutes}, 1, ${awayMs}, ${startedAt}, ${startedAt + durationMs}, ${startedAt}, ${startedAt + durationMs}, null)`,
    );
  }
}

const out = `-- Focus AI — demo akkaunt ma'lumoti
-- Foydalanuvchi: ${userId}
-- Yaratilgan: ${new Date(now).toISOString()}
-- ${HABITS.length} odat · ${sessionRows.length} sessiya · ${DAYS} kunlik tarix · streak ${STREAK_DAYS} kun
--
-- Supabase → SQL Editor'ga qo'yib ishga tushiring. Takroran ishga tushirsangiz
-- avvalgi demo ma'lumot o'chiriladi (faqat shu foydalanuvchiniki).

begin;

delete from public.sessions where user_id = ${q(userId)};
delete from public.habits   where user_id = ${q(userId)};

insert into public.habits
  (id, user_id, name, icon, color, period, target_count, sort_order, created_at, updated_at, deleted_at)
values
${habitRows.join(',\n')};

insert into public.sessions
  (id, user_id, habit_id, duration_ms, target_minutes, completed, away_ms, started_at, ended_at, created_at, updated_at, deleted_at)
values
${sessionRows.join(',\n')};

commit;

-- Tekshiruv:
select
  (select count(*) from public.habits   where user_id = ${q(userId)}) as habits,
  (select count(*) from public.sessions where user_id = ${q(userId)}) as sessions;
`;

process.stdout.write(out);
