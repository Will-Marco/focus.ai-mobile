import { activeDaySet } from '@shared/lib/time/day';
import { currentStreak, longestStreak } from './streak';

const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();
const NOW = day(2026, 6, 28, 15); // yakshanba

describe('currentStreak', () => {
  it('bugun + ketma-ket oldingi kunlar → to\'liq sanaladi', () => {
    const set = activeDaySet([day(2026, 6, 28), day(2026, 6, 27), day(2026, 6, 26)]);
    expect(currentStreak(set, NOW)).toBe(3);
  });

  it("bugun bo'sh, kecha faol → streak buzilmaydi (kechadan sanaydi)", () => {
    const set = activeDaySet([day(2026, 6, 27), day(2026, 6, 26)]);
    expect(currentStreak(set, NOW)).toBe(2);
  });

  it("bugun ham kecha ham bo'sh → 0", () => {
    const set = activeDaySet([day(2026, 6, 26), day(2026, 6, 25)]);
    expect(currentStreak(set, NOW)).toBe(0);
  });

  it('hech qanday sessiya → 0', () => {
    expect(currentStreak(new Set(), NOW)).toBe(0);
  });

  it("bitta bo'sh kun (freeze) ustidan o'tadi", () => {
    // 28,27 faol · 26 BO'SH · 25,24 faol → freeze 26'ni o'tkazadi
    const set = activeDaySet([day(2026, 6, 28), day(2026, 6, 27), day(2026, 6, 25), day(2026, 6, 24)]);
    expect(currentStreak(set, NOW)).toBe(4); // 4 faol kun (bo'sh kun sanalmaydi)
  });

  it("ketma-ket 2 bo'sh kun streak'ni uzadi", () => {
    // 28,27 faol · 26,25 BO'SH · 24 faol → 26-25 ikki bo'sh → uziladi
    const set = activeDaySet([day(2026, 6, 28), day(2026, 6, 27), day(2026, 6, 24)]);
    expect(currentStreak(set, NOW)).toBe(2);
  });

  it("7 kun ichida 2 freeze bo'lmaydi (ikkinchi bo'sh kun uzadi)", () => {
    // 28 · 27 BO'SH · 26 · 25 BO'SH · 24 → birinchi freeze 27, ikkinchi 25 freeze yo'q → 26'da to'xtaydi
    const set = activeDaySet([day(2026, 6, 28), day(2026, 6, 26), day(2026, 6, 24)]);
    expect(currentStreak(set, NOW)).toBe(2); // 28, (freeze 27), 26 → keyin 25 bo'sh, freeze tugagan
  });
});

describe('longestStreak', () => {
  it('eng uzun ketma-ket faol kunlar (freeze\'siz)', () => {
    const set = activeDaySet([
      day(2026, 6, 1), day(2026, 6, 2), day(2026, 6, 3), // 3-run
      day(2026, 6, 10), day(2026, 6, 11), // 2-run
    ]);
    expect(longestStreak(set)).toBe(3);
  });

  it("bo'sh → 0, bitta kun → 1", () => {
    expect(longestStreak(new Set())).toBe(0);
    expect(longestStreak(activeDaySet([day(2026, 6, 1)]))).toBe(1);
  });
});
