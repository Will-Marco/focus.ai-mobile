import { buildBadgeContext, evaluateBadges } from './badges';
import type { SessionStat } from './types';

const at = (hour: number, durMin: number, over: Partial<SessionStat> = {}): SessionStat => ({
  habitId: 'h1',
  durationMs: durMin * 60_000,
  targetMinutes: durMin,
  completed: true,
  awayMs: 0,
  startedAt: new Date(2026, 5, 10, hour).getTime(),
  ...over,
});

describe('buildBadgeContext', () => {
  it('soat oynalarini va jami qiymatlarni yig\'adi', () => {
    const ctx = buildBadgeContext(
      [at(23, 30), at(6, 45), at(5, 20)],
      { current: 3, longest: 5 },
    );
    expect(ctx.totalSessions).toBe(3);
    expect(ctx.totalMinutes).toBe(95);
    expect(ctx.completedCount).toBe(3);
    expect(ctx.hasNight).toBe(true); // 23:00
    expect(ctx.hasEarly).toBe(true); // 06:00
    expect(ctx.hasDawn).toBe(true); // 05:00
    expect(ctx.maxSessionMinutes).toBe(45);
  });
});

describe('evaluateBadges', () => {
  it('yangi foydalanuvchi → faqat ilk-qadam earned', () => {
    const ctx = buildBadgeContext([at(12, 5)], { current: 1, longest: 1 });
    const b = evaluateBadges(ctx);
    expect(b['first-step']).toBe(true);
    expect(b['streak-7']).toBe(false);
    expect(b.team).toBe(false); // M9'gacha locked
    expect(b['golden-ring']).toBe(false);
  });

  it('shartlar bajarilganda earned bo\'ladi', () => {
    const sessions: SessionStat[] = [
      at(23, 130, { awayMs: 40 * 60_000 }), // night + marathon(130) + away 40
    ];
    const ctx = buildBadgeContext(sessions, { current: 14, longest: 7 });
    const b = evaluateBadges(ctx);
    expect(b['streak-7']).toBe(true); // longest 7
    expect(b['night-owl']).toBe(true);
    expect(b.marathon).toBe(true); // 130 daqiqa
    expect(b['phone-free']).toBe(true); // away 40 daqiqa
    expect(b.consistent).toBe(true); // current 14
  });

  it('team faqat teamSessions bo\'lsa', () => {
    const ctx = buildBadgeContext([at(12, 10)], { current: 1, longest: 1 }, 2);
    expect(evaluateBadges(ctx).team).toBe(true);
  });
});
