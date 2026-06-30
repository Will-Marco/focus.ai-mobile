import { activeDaySet, addDays, diffDays, startOfDay } from './day';

// Sobit lokal sana: 2026-06-28 14:30 (timestampdan qat'i nazar lokal kun boshiga tushadi).
const t = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe('day helpers', () => {
  it('startOfDay kun boshiga (00:00) tushiradi', () => {
    expect(startOfDay(t(2026, 6, 28, 14))).toBe(t(2026, 6, 28, 0));
  });

  it("startOfDay bir kunning turli soatlari uchun bir xil qiymat", () => {
    expect(startOfDay(t(2026, 6, 28, 1))).toBe(startOfDay(t(2026, 6, 28, 23)));
  });

  it('addDays orqaga/oldinga kun boshini siljitadi', () => {
    expect(addDays(t(2026, 6, 28, 14), -1)).toBe(t(2026, 6, 27, 0));
    expect(addDays(t(2026, 6, 28, 14), 2)).toBe(t(2026, 6, 30, 0));
  });

  it('addDays oy chegarasidan o\'tadi', () => {
    expect(addDays(t(2026, 7, 1, 9), -1)).toBe(t(2026, 6, 30, 0));
  });

  it('diffDays kalendar-kunlar farqini beradi', () => {
    expect(diffDays(t(2026, 6, 20, 23), t(2026, 6, 28, 1))).toBe(8);
    expect(diffDays(t(2026, 6, 28, 1), t(2026, 6, 28, 23))).toBe(0);
  });

  it('activeDaySet bir kundagi bir nechta sessiyani bitta kunga yig\'adi', () => {
    const set = activeDaySet([t(2026, 6, 28, 8), t(2026, 6, 28, 20), t(2026, 6, 27, 10)]);
    expect(set.size).toBe(2);
    expect(set.has(t(2026, 6, 28, 0))).toBe(true);
    expect(set.has(t(2026, 6, 27, 0))).toBe(true);
  });
});
