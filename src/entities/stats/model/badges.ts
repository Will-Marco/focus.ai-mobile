import type { SessionStat } from './types';

// 12 badge (FR-6.3 "10+"). Dizayn tartibida. Earned = pure predikat (sana saqlanmaydi).
export type BadgeId =
  | 'first-step'
  | 'streak-7'
  | 'focus-master'
  | 'night-owl'
  | 'phone-free'
  | 'team'
  | 'marathon'
  | 'golden-ring'
  | 'consistent'
  | 'early-bird'
  | 'deep-work'
  | 'dawn';

export const BADGE_IDS: BadgeId[] = [
  'first-step',
  'streak-7',
  'focus-master',
  'night-owl',
  'phone-free',
  'team',
  'marathon',
  'golden-ring',
  'consistent',
  'early-bird',
  'deep-work',
  'dawn',
];

export interface BadgeContext {
  totalSessions: number;
  totalMinutes: number;
  completedCount: number;
  awayMinutes: number;
  maxSessionMinutes: number;
  currentStreak: number;
  longestStreak: number;
  hasNight: boolean; // soat ≥ 22
  hasEarly: boolean; // soat 5..8
  hasDawn: boolean; // soat < 6
  /** jamoa sessiyalari (M9 — hozircha 0). */
  teamSessions: number;
}

const MIN_MS = 60_000;

export function buildBadgeContext(
  sessions: SessionStat[],
  streak: { current: number; longest: number },
  teamSessions = 0,
): BadgeContext {
  let totalMinutes = 0;
  let completedCount = 0;
  let awayMinutes = 0;
  let maxSessionMinutes = 0;
  let hasNight = false;
  let hasEarly = false;
  let hasDawn = false;

  for (const s of sessions) {
    const min = Math.floor(s.durationMs / MIN_MS);
    totalMinutes += min;
    awayMinutes += Math.floor(s.awayMs / MIN_MS);
    if (s.completed) completedCount += 1;
    if (min > maxSessionMinutes) maxSessionMinutes = min;
    const hour = new Date(s.startedAt).getHours();
    if (hour >= 22) hasNight = true;
    if (hour >= 5 && hour < 8) hasEarly = true;
    if (hour < 6) hasDawn = true;
  }

  return {
    totalSessions: sessions.length,
    totalMinutes,
    completedCount,
    awayMinutes,
    maxSessionMinutes,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    hasNight,
    hasEarly,
    hasDawn,
    teamSessions,
  };
}

const PREDICATES: Record<BadgeId, (c: BadgeContext) => boolean> = {
  'first-step': (c) => c.totalSessions >= 1,
  'streak-7': (c) => c.longestStreak >= 7,
  'focus-master': (c) => c.totalMinutes >= 600, // 10 soat jami
  'night-owl': (c) => c.hasNight,
  'phone-free': (c) => c.awayMinutes >= 30,
  team: (c) => c.teamSessions >= 1,
  marathon: (c) => c.maxSessionMinutes >= 120, // bitta sessiya 2 soat
  'golden-ring': (c) => c.completedCount >= 10,
  consistent: (c) => c.currentStreak >= 14,
  'early-bird': (c) => c.hasEarly,
  'deep-work': (c) => c.totalMinutes >= 3000, // 50 soat jami
  dawn: (c) => c.hasDawn,
};

/** Har badge uchun earned holati. */
export function evaluateBadges(ctx: BadgeContext): Record<BadgeId, boolean> {
  const out = {} as Record<BadgeId, boolean>;
  for (const id of BADGE_IDS) out[id] = PREDICATES[id](ctx);
  return out;
}
