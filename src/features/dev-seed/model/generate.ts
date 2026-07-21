import type { HabitDraft } from '@entities/habit';
import type { SessionDraft } from '@entities/session';

/**
 * Demo ma'lumot generatori — skrinshot va demo video uchun.
 *
 * NEGA KERAK: streak, heatmap va statistika grafiklari **o'tgan kunlardagi** sessiyalarga
 * tayanadi — ularni ilovada qo'lda yaratib bo'lmaydi (vaqt orqaga qaytmaydi). Bo'sh
 * ekranlarni suratga olish esa ilovani real ishlatilmagandek ko'rsatadi.
 *
 * Pure: I/O yo'q, `now` parametr sifatida beriladi va PRNG deterministik —
 * ya'ni bir xil kirish har doim bir xil natija beradi (test qilinadi).
 */

/* eslint-disable no-bitwise -- mulberry32 PRNG bit operatsiyalarisiz ishlamaydi */
/** mulberry32 — kichik, deterministik PRNG (seed bir xil → ketma-ketlik bir xil). */
function rng(seed: number): () => number {
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

export const DEMO_HABITS: readonly HabitDraft[] = [
  { name: 'Mutolaa', icon: 'book', color: 'amber', period: 'daily', targetCount: 2 },
  { name: 'Sport', icon: 'dumbbell', color: 'coral', period: 'daily', targetCount: 1 },
  { name: 'Ingliz tili', icon: 'brain', color: 'purple', period: 'daily', targetCount: 1 },
  { name: 'Meditatsiya', icon: 'leaf', color: 'gold', period: 'daily', targetCount: 1 },
  { name: 'Loyiha ustida ish', icon: 'code', color: 'teal', period: 'weekly', targetCount: 5 },
] as const;

const DAY_MS = 86_400_000;

/** Sessiya davomiyliklari (daqiqa) — odat indeksiga qarab tabiiy taqsimot. */
const DURATIONS = [
  [25, 45], // Mutolaa
  [30, 45], // Sport
  [15, 25], // Ingliz tili
  [10, 15], // Meditatsiya
  [45, 60], // Loyiha
];

export interface GenerateOptions {
  /** Nechta kunlik tarix (heatmap ~3 oyni ko'rsatadi). */
  days?: number;
  /** So'nggi shuncha kun uzluksiz — joriy streak shu qiymatga teng bo'ladi. */
  streakDays?: number;
  seed?: number;
}

/**
 * Odat indekslari bo'yicha sessiya qoralamalarini yaratadi.
 * `habitIds` — DEMO_HABITS bilan bir tartibda bo'lishi kerak.
 */
export function generateSessions(habitIds: readonly string[], now: number, opts: GenerateOptions = {}): SessionDraft[] {
  const { days = 75, streakDays = 16, seed = 20260727 } = opts;
  const rand = rng(seed);
  const out: SessionDraft[] = [];

  // Kun boshini mahalliy vaqt bo'yicha olamiz (streak/heatmap kun chegarasi shunday).
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  for (let dayBack = days - 1; dayBack >= 0; dayBack--) {
    const dayStart = startOfToday.getTime() - dayBack * DAY_MS;
    const inStreak = dayBack < streakDays;

    // Streak oynasida har kuni sessiya bor; undan oldin bo'shliqlar qoladi —
    // heatmap "real ishlatilgan" ko'rinishga ega bo'lsin.
    if (!inStreak && rand() > 0.62) continue;

    const sessionCount = inStreak ? 1 + Math.floor(rand() * 3) : 1 + Math.floor(rand() * 2);

    for (let s = 0; s < sessionCount; s++) {
      const habitIdx = Math.floor(rand() * habitIds.length);
      const habitId = habitIds[habitIdx];
      if (!habitId) continue;

      const [minMin, maxMin] = DURATIONS[habitIdx] ?? [25, 45];
      const targetMinutes = minMin + Math.floor(rand() * (maxMin - minMin + 1));

      // Sessiyalar kun davomida tarqalsin (08:00–22:00).
      const hour = 8 + Math.floor(rand() * 14);
      const startedAt = dayStart + hour * 3_600_000 + Math.floor(rand() * 3_600_000);

      // Ko'pchilik sessiya maqsadga yetadi; ba'zilari overtime bilan oshadi.
      const overtime = rand() > 0.78 ? Math.floor(rand() * 10) : 0;
      const durationMs = (targetMinutes + overtime) * 60_000;

      // Uchdan biri "Away" (telefon yuztuban) — 2× XP bonusi statistikada ko'rinsin.
      const awayMs = rand() > 0.66 ? Math.floor(durationMs * (0.3 + rand() * 0.5)) : 0;

      out.push({
        habitId,
        durationMs,
        targetMinutes,
        completed: true,
        awayMs,
        startedAt,
        endedAt: startedAt + durationMs,
      });
    }
  }

  return out.sort((a, b) => a.startedAt - b.startedAt);
}
