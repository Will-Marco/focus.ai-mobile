import { activeDaySet } from '@shared/lib/time/day';
import { buildHeatmap, buildSeries, dailyMinutes, heatLevel, last7Done, monthColumns } from './aggregate';
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
    const june = hm.months[hm.months.length - 1];
    expect(june.days[27]).toBe(3); // 28-iyun → 90 daqiqa → level 3
    expect(june.days[26]).toBe(1); // 27-iyun → 20 daqiqa → level 1
  });

  it("sessiyasiz — hamma kun 0", () => {
    const hm = buildHeatmap([], NOW);
    expect(hm.activeDays).toBe(0);
    expect(hm.months.every((m) => m.days.every((d) => d === 0))).toBe(true);
  });

  describe('kalendar tuzilishi (oy = alohida blok)', () => {
    it('oxirgi 12 oyni qaytaradi, oxirgisi joriy oy', () => {
      const hm = buildHeatmap([], NOW);
      expect(hm.months).toHaveLength(12);
      const last = hm.months[11];
      expect(last.month).toBe(5); // NOW = 2026-iyun
      expect(last.year).toBe(2026);
      // Birinchisi bir yil oldingi iyul
      expect(hm.months[0]).toMatchObject({ month: 6, year: 2025 });
    });

    it('har oyda kalendar bo\'yicha to\'g\'ri kunlar soni bor', () => {
      const hm = buildHeatmap([], NOW);
      const len = (m: number, y: number) => hm.months.find((x) => x.month === m && x.year === y)!.days.length;
      expect(len(0, 2026)).toBe(31); // Yanvar
      expect(len(1, 2026)).toBe(28); // Fevral 2026 — kabisa emas
      expect(len(3, 2026)).toBe(30); // Aprel
      expect(len(5, 2026)).toBe(30); // Iyun
    });

    it('startDow oyning 1-kuni haqiqiy hafta kuniga to\'g\'ri keladi (0=Du)', () => {
      const hm = buildHeatmap([], NOW);
      for (const m of hm.months) {
        const first = new Date(m.year, m.month, 1);
        expect(m.startDow).toBe((first.getDay() + 6) % 7);
      }
      // 2026-yil 1-iyun — dushanba
      expect(hm.months.find((m) => m.month === 5 && m.year === 2026)!.startDow).toBe(0);
      // 2026-yil 1-yanvar — payshanba
      expect(hm.months.find((m) => m.month === 0 && m.year === 2026)!.startDow).toBe(3);
    });

    it('sessiya kuni oyning to\'g\'ri indeksiga tushadi', () => {
      // 27-iyun 90 daqiqa → level 3, indeks 26 (oyning 27-kuni)
      const hm = buildHeatmap([mk(day(2026, 6, 27), 90)], NOW);
      const june = hm.months.find((m) => m.month === 5 && m.year === 2026)!;
      expect(june.days[26]).toBe(3);
      expect(june.days[25]).toBe(0);
    });

    it('kelajak kunlar 0 va activeDays ga qo\'shilmaydi', () => {
      const hm = buildHeatmap([mk(day(2026, 6, 28), 40)], NOW);
      const june = hm.months.find((m) => m.month === 5 && m.year === 2026)!;
      expect(june.days[27]).toBe(2); // 28-iyun = bugun
      expect(june.days[28]).toBe(0); // 29-iyun = kelajak
      expect(hm.activeDays).toBe(1);
    });
  });
});

describe('monthColumns', () => {
  it('boshidagi bo\'sh kataklarni startDow bo\'yicha qo\'yadi', () => {
    // 1-kun chorshanba (startDow=2) → birinchi ustunda 2 ta null
    const cols = monthColumns({ month: 0, year: 2026, startDow: 2, days: Array(31).fill(0) });
    expect(cols[0][0]).toBeNull();
    expect(cols[0][1]).toBeNull();
    expect(cols[0][2]).toBe(0);
  });

  it('oxirgi ustunni 7 katakka to\'ldiradi', () => {
    const cols = monthColumns({ month: 5, year: 2026, startDow: 0, days: Array(30).fill(1) });
    for (const col of cols) expect(col).toHaveLength(7);
    // 30 kun + 0 bo'shliq = 30 → 5 ustun (35 katak), oxirida 5 ta null
    expect(cols).toHaveLength(5);
    expect(cols[4].filter((c) => c === null)).toHaveLength(5);
  });

  it('hamma kunni tartibda joylaydi', () => {
    const days = Array.from({ length: 30 }, (_, i) => (i % 5) as number);
    const cols = monthColumns({ month: 5, year: 2026, startDow: 3, days });
    const flat = cols.flat().filter((c): c is number => c !== null);
    expect(flat).toEqual(days);
  });
});

describe('last7Done', () => {
  it('joriy hafta (Du..Ya) faol kunlarini belgilaydi', () => {
    const active = activeDaySet([day(2026, 6, 22), day(2026, 6, 28)]);
    expect(last7Done(active, NOW)).toEqual([true, false, false, false, false, false, true]);
  });
});
