import { levelFromXp, sessionXp, totalXp } from './xp';
import type { SessionStat } from './types';

const day = (d: number, h = 12) => new Date(2026, 5, d, h).getTime();
const mk = (over: Partial<SessionStat>): SessionStat => ({
  habitId: 'h1',
  durationMs: 0,
  targetMinutes: 25,
  completed: false,
  awayMs: 0,
  startedAt: day(1),
  ...over,
});

describe('sessionXp', () => {
  it('daqiqa = 1 XP', () => {
    expect(sessionXp(mk({ durationMs: 25 * 60_000 }))).toBe(25);
  });

  it('100% → +50', () => {
    expect(sessionXp(mk({ durationMs: 25 * 60_000, completed: true }))).toBe(75);
  });

  it('away daqiqalari 2× (qo\'shimcha 1 XP)', () => {
    // 25 daqiqa fokus, shundan 10 away → 25 + 10 = 35
    expect(sessionXp(mk({ durationMs: 25 * 60_000, awayMs: 10 * 60_000 }))).toBe(35);
  });
});

describe('totalXp', () => {
  it('sessiya XP + har faol kun uchun +10', () => {
    const sessions = [
      mk({ durationMs: 30 * 60_000, completed: true, startedAt: day(1) }), // 30+50=80
      mk({ durationMs: 20 * 60_000, startedAt: day(1, 18) }), // 20  (xuddi shu kun)
      mk({ durationMs: 40 * 60_000, startedAt: day(2) }), // 40
    ];
    // base = 80+20+40 = 140; faol kun = 2 → +20 → 160
    expect(totalXp(sessions)).toBe(160);
  });

  it('sessiya yo\'q → 0', () => {
    expect(totalXp([])).toBe(0);
  });
});

describe('levelFromXp', () => {
  it('0 XP → level 1', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, current: 0, span: 100, floorXp: 0 });
  });

  it('100 XP → level 2 boshi', () => {
    const l = levelFromXp(100);
    expect(l.level).toBe(2);
    expect(l.current).toBe(0);
    expect(l.span).toBe(150);
    expect(l.floorXp).toBe(100);
  });

  it('120 XP → level 2, 20 ichida', () => {
    const l = levelFromXp(120);
    expect(l.level).toBe(2);
    expect(l.current).toBe(20);
  });

  it("250 XP → level 3 (100+150 chegara)", () => {
    expect(levelFromXp(250).level).toBe(3);
  });
});
