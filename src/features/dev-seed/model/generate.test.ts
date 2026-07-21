import { DEMO_HABITS, generateSessions } from './generate';

const IDS = ['h1', 'h2', 'h3', 'h4', 'h5'];
// 2026-07-21, 12:00 mahalliy — sinov uchun qat'iy nuqta.
const NOW = new Date(2026, 6, 21, 12, 0, 0).getTime();
const DAY_MS = 86_400_000;

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

describe('generateSessions', () => {
  it('deterministik — bir xil seed bir xil natija beradi', () => {
    const a = generateSessions(IDS, NOW, { seed: 42 });
    const b = generateSessions(IDS, NOW, { seed: 42 });
    expect(a).toEqual(b);
  });

  it('boshqa seed boshqa natija beradi', () => {
    const a = generateSessions(IDS, NOW, { seed: 1 });
    const b = generateSessions(IDS, NOW, { seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('streak oynasidagi HAR kunda kamida bitta sessiya bor', () => {
    const streakDays = 16;
    const sessions = generateSessions(IDS, NOW, { streakDays });
    const days = new Set(sessions.map((s) => dayKey(s.startedAt)));

    const startOfToday = new Date(NOW);
    startOfToday.setHours(0, 0, 0, 0);
    for (let i = 0; i < streakDays; i++) {
      expect(days.has(dayKey(startOfToday.getTime() - i * DAY_MS))).toBe(true);
    }
  });

  it('streakdan oldin bo\'shliqlar qoldiradi — heatmap real ko\'rinsin', () => {
    const sessions = generateSessions(IDS, NOW, { days: 75, streakDays: 16 });
    const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
    // 75 kunning hammasi to'lgan bo'lsa, naqsh sun'iy ko'rinadi.
    expect(days.size).toBeLessThan(75);
  });

  it('vaqt oralig\'idan chiqmaydi va endedAt startedAt dan keyin', () => {
    const sessions = generateSessions(IDS, NOW, { days: 30 });
    const earliest = NOW - 30 * DAY_MS;
    for (const s of sessions) {
      expect(s.startedAt).toBeGreaterThanOrEqual(earliest);
      expect(s.endedAt).toBeGreaterThan(s.startedAt);
      expect(s.durationMs).toBe(s.endedAt - s.startedAt);
    }
  });

  it('faqat berilgan habitId larni ishlatadi va awayMs davomiylikdan oshmaydi', () => {
    const sessions = generateSessions(IDS, NOW);
    for (const s of sessions) {
      expect(IDS).toContain(s.habitId);
      expect(s.awayMs ?? 0).toBeLessThanOrEqual(s.durationMs);
      expect(s.awayMs ?? 0).toBeGreaterThanOrEqual(0);
    }
  });

  it('vaqt bo\'yicha tartiblangan', () => {
    const sessions = generateSessions(IDS, NOW);
    for (let i = 1; i < sessions.length; i++) {
      expect(sessions[i].startedAt).toBeGreaterThanOrEqual(sessions[i - 1].startedAt);
    }
  });

  it('demo odatlar to\'plami statistikani to\'ldirish uchun yetarli xilma-xil', () => {
    expect(DEMO_HABITS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(DEMO_HABITS.map((h) => h.color)).size).toBeGreaterThanOrEqual(4);
    expect(DEMO_HABITS.some((h) => h.period === 'weekly')).toBe(true);
  });
});
