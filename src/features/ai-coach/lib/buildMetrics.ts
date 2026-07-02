import type { StatsSummary } from '@entities/stats';
import { startOfDay } from '@shared/lib/time/day';
import type { CoachMetrics } from '../model/types';

const MIN = 60_000;
const WINDOW_DAYS = 30;

/**
 * StatsSummary → anonim CoachMetrics (Edge Function payloadi).
 * Faqat sonli agregatlar — ism, odat nomi yoki matn YO'Q (SRS FR-10.2).
 * `now` deterministik test uchun parametr.
 */
export function buildMetrics(summary: StatsSummary, now: number): CoachMetrics {
  const threshold = now - WINDOW_DAYS * 86_400_000;
  const recent = summary.sessions.filter((s) => s.startedAt >= threshold);

  let totalMs = 0;
  let awayMs = 0;
  let completed = 0;
  const days = new Set<number>();
  const habits = new Set<string>();
  const hourMinutes = new Map<number, number>();

  for (const s of recent) {
    totalMs += s.durationMs;
    awayMs += s.awayMs;
    if (s.completed) completed += 1;
    days.add(startOfDay(s.startedAt));
    habits.add(s.habitId);
    const hour = new Date(s.startedAt).getHours();
    hourMinutes.set(hour, (hourMinutes.get(hour) ?? 0) + s.durationMs / MIN);
  }

  const last30Minutes = Math.round(totalMs / MIN);
  const last30Sessions = recent.length;

  return {
    streakCurrent: summary.streak.current,
    streakLongest: summary.streak.longest,
    level: summary.level.level,
    totalXp: summary.totalXp,
    last7Active: summary.last7,
    last30Minutes,
    last30Sessions,
    last30Completed: completed,
    last30ActiveDays: days.size,
    avgSessionMinutes: last30Sessions ? Math.round(last30Minutes / last30Sessions) : 0,
    bestHour: peakHour(hourMinutes),
    habitCount: habits.size,
    awayMinutes: Math.round(awayMs / MIN),
  };
}

// Eng ko'p fokus daqiqasi to'plangan soatni qaytaradi (teng bo'lsa eng erta soat).
function peakHour(hourMinutes: Map<number, number>): number | null {
  let best: number | null = null;
  let bestMin = -1;
  for (const [hour, min] of hourMinutes) {
    if (min > bestMin || (min === bestMin && best !== null && hour < best)) {
      best = hour;
      bestMin = min;
    }
  }
  return best;
}
