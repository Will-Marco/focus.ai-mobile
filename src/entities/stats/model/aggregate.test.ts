import { activeDaySet } from '@shared/lib/time/day';
import { buildHeatmap, buildSeries, dailyMinutes, heatLevel, last7Done } from './aggregate';
import type { SessionStat } from './types';

const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();
const NOW = day(2026, 6, 28, 15); // yakshanba (joriy hafta Du=22..Ya=28)

const mk = (startedAt: number, durMin: number): SessionStat => ({
  habitId: 'h1',
  durationMs: durMin * 60_000,
  targetMinutes: durMin,
  completed: true,
  awayMs: 0,
  startedAt,
});

describe('dailyMinutes', () => {
  it('bir kundagi sessiyalarni daqiqalab yig\'adi', () => {
    const map = dailyMinutes([mk(day(2026, 6, 28, 8), 30), mk(day(2026, 6, 28, 20), 15), mk(day(2026, 6, 27), 60)]);
    expect(map.get(day(2026, 6, 28, 0))).toBe(45);
    expect(map.get(day(2026, 6, 27, 0))).toBe(60);
  });
});

describe('heatLevel', () => {
  it('daqiqani darajaga (0..4) tushiradi', () => {
    expect(heatLevel(0)).toBe(0);
    expect(heatLevel(10)).toBe(1);
    expect(heatLevel(45)).toBe(2);
    expect(heatLevel(90)).toBe(3);
    expect(heatLevel(200)).toBe(4);
  });
});

describe('buildSeries (week)', () => {
  it('joriy hafta kunlari bo\'yicha daqiqa + oldingi haftaga taqqoslash', () => {
    const sessions = [
      mk(day(2026, 6, 22), 60), // Du
      mk(day(2026, 6, 28), 30), // Ya
      mk(day(2026, 6, 15), 45), // oldingi hafta (Du)
    ];
    const s = buildSeries('week', sessions, NOW);
    expect(s.mins).toEqual([60, 0, 0, 0, 0, 0, 30]);
    expect(s.totalMin).toBe(90);
    expect(s.comparePct).toBe(100); // 90 vs 45 → +100%
    expect(s.up).toBe(true);
  });

  it("oldingi davr bo'sh + joriy bo'sh → comparePct null", () => {
    const s = buildSeries('week', [], NOW);
    expect(s.totalMin).toBe(0);
    expect(s.comparePct).toBeNull();
  });
});

describe('buildHeatmap', () => {
  it('faol kunlarni sanaydi va joriy kun darajasini joylaydi', () => {
    const hm = buildHeatmap([mk(day(2026, 6, 28), 90), mk(day(2026, 6, 27), 20)], NOW);
    expect(hm.activeDays).toBe(2);
    const lastWeek = hm.weeks[hm.weeks.length - 1];
    expect(lastWeek[6]).toBe(3); // Yakshanba 28 → 90 daqiqa → level 3
    expect(lastWeek[5]).toBe(1); // Shanba 27 → 20 daqiqa → level 1
  });

  it("kelajak kunlar 0", () => {
    const hm = buildHeatmap([], NOW);
    expect(hm.activeDays).toBe(0);
    expect(hm.weeks).toHaveLength(53);
  });

  describe('oy yorliqlari (GitHub uslubi)', () => {
    it('har ustun uchun bitta yorliq qaytaradi', () => {
      const hm = buildHeatmap([], NOW);
      expect(hm.monthLabels).toHaveLength(hm.weeks.length);
    });

    it('oy nomi faqat shu oy boshlangan ustunda turadi, qolganlari null', () => {
      const hm = buildHeatmap([], NOW);
      const marked = hm.monthLabels.filter((m) => m !== null);
      // 53 hafta ≈ 12–13 oy chegarasi
      expect(marked.length).toBeGreaterThanOrEqual(11);
      expect(marked.length).toBeLessThanOrEqual(13);
    });

    it('yorliqlar 0..11 oralig\'ida va vaqt bo\'yicha ketma-ket', () => {
      const hm = buildHeatmap([], NOW);
      const marked = hm.monthLabels.filter((m): m is number => m !== null);
      for (const m of marked) {
        expect(m).toBeGreaterThanOrEqual(0);
        expect(m).toBeLessThanOrEqual(11);
      }
      // Ketma-ket yorliqlar takrorlanmaydi (bir oy ikki marta belgilanmaydi)
      for (let i = 1; i < marked.length; i++) {
        expect(marked[i]).not.toBe(marked[i - 1]);
      }
    });

    it('oxirgi ustun joriy oyga tegishli', () => {
      const hm = buildHeatmap([], NOW);
      // NOW = 2026-06-28 (iyun = indeks 5). Oxirgi belgilangan yorliq iyun yoki undan oldingi oy.
      const lastMarked = [...hm.monthLabels].reverse().find((m) => m !== null);
      expect(lastMarked).toBe(5);
    });
  });
});

describe('last7Done', () => {
  it('joriy hafta (Du..Ya) faol kunlarini belgilaydi', () => {
    const active = activeDaySet([day(2026, 6, 22), day(2026, 6, 28)]);
    expect(last7Done(active, NOW)).toEqual([true, false, false, false, false, false, true]);
  });
});
