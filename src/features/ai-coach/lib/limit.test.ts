import { canFetch, DAILY_LIMIT, recordFetch, remaining, todayKey, usageToday, type UsageRecord } from './limit';

const DAY = 86_400_000;
const NOW = 1_750_000_000_000;

describe('AI coach kunlik limit', () => {
  it('yozuv yo\'q bo\'lsa 0 ishlatilgan, to\'liq limit qolgan', () => {
    expect(usageToday(null, NOW)).toBe(0);
    expect(remaining(null, NOW)).toBe(DAILY_LIMIT);
    expect(canFetch(null, NOW)).toBe(true);
  });

  it('boshqa kunning yozuvi bugun 0 ga tenglashadi (avto-reset)', () => {
    const yesterday: UsageRecord = { day: todayKey(NOW - DAY), count: DAILY_LIMIT };
    expect(usageToday(yesterday, NOW)).toBe(0);
    expect(canFetch(yesterday, NOW)).toBe(true);
  });

  it('recordFetch bir kun ichida oshiradi', () => {
    let rec = recordFetch(null, NOW);
    expect(rec.count).toBe(1);
    rec = recordFetch(rec, NOW);
    expect(rec.count).toBe(2);
    expect(rec.day).toBe(todayKey(NOW));
  });

  it('kun almashsa recordFetch 1 dan boshlaydi', () => {
    const rec: UsageRecord = { day: todayKey(NOW), count: 4 };
    const next = recordFetch(rec, NOW + DAY);
    expect(next.count).toBe(1);
    expect(next.day).toBe(todayKey(NOW + DAY));
  });

  it('limitga yetganda canFetch false, remaining 0', () => {
    const full: UsageRecord = { day: todayKey(NOW), count: DAILY_LIMIT };
    expect(canFetch(full, NOW)).toBe(false);
    expect(remaining(full, NOW)).toBe(0);
  });
});
