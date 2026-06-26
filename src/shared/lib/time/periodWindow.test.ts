import { periodWindow } from './periodWindow';

// Aniq sana: 2026-06-26 (juma), local vaqt. now — kun o'rtasi.
const now = new Date(2026, 5, 26, 14, 30, 0).getTime();

describe('periodWindow', () => {
  it('daily: shu kun 00:00 (local) dan keyingi kun 00:00 gacha', () => {
    const { from, to } = periodWindow('daily', now);
    const f = new Date(from);
    expect(f.getHours()).toBe(0);
    expect(f.getMinutes()).toBe(0);
    expect(f.getSeconds()).toBe(0);
    expect(f.getMilliseconds()).toBe(0);
    expect(from).toBeLessThanOrEqual(now);
    expect(to).toBeGreaterThan(now);
    expect(to - from).toBe(24 * 60 * 60 * 1000);
  });

  it('weekly: oyna dushanbadan boshlanadi', () => {
    const { from, to } = periodWindow('weekly', now);
    expect(new Date(from).getDay()).toBe(1); // 1 = dushanba
    expect(new Date(from).getHours()).toBe(0);
    expect(from).toBeLessThanOrEqual(now);
    expect(to).toBeGreaterThan(now);
    expect(to - from).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("weekly: yakshanba ham o'tgan dushanbaga tegishli (sunday-edge)", () => {
    const sunday = new Date(2026, 5, 28, 10, 0, 0).getTime(); // 2026-06-28 yakshanba
    const { from } = periodWindow('weekly', sunday);
    expect(new Date(from).getDay()).toBe(1);
    expect(new Date(from).getDate()).toBe(22); // 22-iyun dushanba
  });

  it('monthly: oyning 1-kuni 00:00 dan keyingi oy 1-kuniga gacha', () => {
    const { from, to } = periodWindow('monthly', now);
    expect(new Date(from).getDate()).toBe(1);
    expect(new Date(from).getMonth()).toBe(5); // iyun
    expect(new Date(to).getDate()).toBe(1);
    expect(new Date(to).getMonth()).toBe(6); // iyul
    expect(from).toBeLessThanOrEqual(now);
    expect(to).toBeGreaterThan(now);
  });

  it("monthly: dekabr → keyingi yil yanvariga o'tadi", () => {
    const dec = new Date(2026, 11, 15, 12, 0, 0).getTime();
    const { to } = periodWindow('monthly', dec);
    expect(new Date(to).getFullYear()).toBe(2027);
    expect(new Date(to).getMonth()).toBe(0); // yanvar
  });
});
