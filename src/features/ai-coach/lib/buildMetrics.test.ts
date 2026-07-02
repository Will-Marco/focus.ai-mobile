import { buildMetrics } from './buildMetrics';
import type { StatsSummary } from '@entities/stats';
import type { SessionStat } from '@entities/stats';

const DAY = 86_400_000;
const HOUR = 3_600_000;
// Barqaror "hozir": 2026-06-15 12:00 UTC atrofi (aniq qiymat muhim emas, nisbiy).
const NOW = 1_750_000_000_000;

function session(partial: Partial<SessionStat>): SessionStat {
  return {
    habitId: 'h1',
    durationMs: 25 * 60_000,
    targetMinutes: 25,
    completed: true,
    awayMs: 0,
    startedAt: NOW,
    ...partial,
  };
}

function summary(sessions: SessionStat[]): StatsSummary {
  return {
    loaded: true,
    now: NOW,
    sessions,
    streak: { current: 4, longest: 9 } as StatsSummary['streak'],
    totalXp: 1234,
    level: { level: 5 } as StatsSummary['level'],
    last7: [true, false, true, true, false, true, true],
    heatmap: {} as StatsSummary['heatmap'],
    badges: {} as StatsSummary['badges'],
  };
}

describe('buildMetrics — anonim metrikalar', () => {
  it('streak/level/xp/last7 ni xulosadan ko\'chiradi', () => {
    const m = buildMetrics(summary([]), NOW);
    expect(m.streakCurrent).toBe(4);
    expect(m.streakLongest).toBe(9);
    expect(m.level).toBe(5);
    expect(m.totalXp).toBe(1234);
    expect(m.last7Active).toEqual([true, false, true, true, false, true, true]);
  });

  it('oxirgi 30 kun ichidagi sessiyalarni yig\'adi, eskilarini chetlaydi', () => {
    const sessions = [
      session({ startedAt: NOW - 2 * DAY, durationMs: 30 * 60_000, targetMinutes: 30, completed: true }),
      session({ startedAt: NOW - 5 * DAY, durationMs: 10 * 60_000, targetMinutes: 20, completed: false }),
      session({ startedAt: NOW - 40 * DAY, durationMs: 60 * 60_000, targetMinutes: 60, completed: true }), // eski — chetda
    ];
    const m = buildMetrics(summary(sessions), NOW);
    expect(m.last30Sessions).toBe(2);
    expect(m.last30Minutes).toBe(40); // 30 + 10
    expect(m.last30Completed).toBe(1);
    expect(m.avgSessionMinutes).toBe(20); // 40 / 2
  });

  it('faol kunlarni va odatlar sonini hisoblaydi', () => {
    const sessions = [
      session({ startedAt: NOW - 1 * DAY, habitId: 'a' }),
      session({ startedAt: NOW - 1 * DAY, habitId: 'b' }), // bir kun, boshqa odat
      session({ startedAt: NOW - 3 * DAY, habitId: 'a' }),
    ];
    const m = buildMetrics(summary(sessions), NOW);
    expect(m.last30ActiveDays).toBe(2);
    expect(m.habitCount).toBe(2);
  });

  it('eng samarali soatni fokus daqiqasi bo\'yicha aniqlaydi', () => {
    const nine = NOW - (NOW % DAY) + 9 * HOUR; // shu kunning 09:00 (lokal emas — UTC, test uchun yetarli)
    const fifteen = NOW - (NOW % DAY) + 15 * HOUR;
    const sessions = [
      session({ startedAt: nine, durationMs: 10 * 60_000 }),
      session({ startedAt: fifteen, durationMs: 50 * 60_000 }), // ko'proq daqiqa → g'olib
    ];
    const m = buildMetrics(summary(sessions), NOW);
    expect(m.bestHour).toBe(new Date(fifteen).getHours());
  });

  it('sessiya bo\'lmasa bestHour null, avg 0', () => {
    const m = buildMetrics(summary([]), NOW);
    expect(m.bestHour).toBeNull();
    expect(m.avgSessionMinutes).toBe(0);
    expect(m.last30Sessions).toBe(0);
  });

  it('away daqiqalarini yig\'adi (signature feature)', () => {
    const sessions = [
      session({ startedAt: NOW - 1 * DAY, awayMs: 5 * 60_000 }),
      session({ startedAt: NOW - 2 * DAY, awayMs: 15 * 60_000 }),
    ];
    const m = buildMetrics(summary(sessions), NOW);
    expect(m.awayMinutes).toBe(20);
  });
});
