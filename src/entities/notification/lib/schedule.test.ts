import { nextDailyAtMinute, nextReminderTrigger, nextWeeklyAtMinute } from './schedule';

// Deterministik: barcha vaqtlar mahalliy zonada hisoblanadi.
const at = (y: number, mo: number, d: number, h: number, mi: number) =>
  new Date(y, mo, d, h, mi, 0, 0).getTime();

describe('nextDailyAtMinute', () => {
  it('schedules later today when the time is still ahead', () => {
    const now = at(2026, 5, 30, 9, 0); // 09:00
    const ts = nextDailyAtMinute(now, 21 * 60); // 21:00
    expect(new Date(ts).getHours()).toBe(21);
    expect(new Date(ts).getDate()).toBe(30);
  });

  it('rolls to tomorrow when the time has passed', () => {
    const now = at(2026, 5, 30, 22, 0); // 22:00
    const ts = nextDailyAtMinute(now, 21 * 60); // 21:00 already gone
    expect(new Date(ts).getHours()).toBe(21);
    expect(new Date(ts).getDate()).toBe(1); // July 1 (June has 30 days)
  });

  it('rolls to tomorrow when exactly now (<=)', () => {
    const now = at(2026, 5, 30, 21, 0);
    const ts = nextDailyAtMinute(now, 21 * 60);
    expect(new Date(ts).getDate()).toBe(1); // July 1
  });
});

describe('nextWeeklyAtMinute', () => {
  it('schedules this week when the weekday/time is still ahead', () => {
    // 2026-06-30 is a Tuesday (getDay()===2)
    const now = at(2026, 5, 30, 9, 0);
    const ts = nextWeeklyAtMinute(now, 0, 20 * 60); // next Sunday 20:00
    const dt = new Date(ts);
    expect(dt.getDay()).toBe(0);
    expect(dt.getHours()).toBe(20);
    expect(dt.getDate()).toBe(5); // Sunday July 5
  });

  it('rolls a week when the same weekday time has passed', () => {
    const now = at(2026, 5, 30, 9, 0); // Tuesday 09:00
    const ts = nextWeeklyAtMinute(now, 2, 8 * 60); // Tuesday 08:00 already passed
    expect(new Date(ts).getDate()).toBe(7); // next Tuesday July 7
  });
});

describe('nextReminderTrigger', () => {
  const quietOn = { enabled: true, start: '22:00', end: '07:00' };

  it('keeps the reminder time when it is outside quiet hours', () => {
    const now = at(2026, 5, 30, 9, 0);
    const ts = nextReminderTrigger(now, '21:00', quietOn);
    expect(new Date(ts).getHours()).toBe(21);
  });

  it('shifts the reminder to quiet-end when it lands inside quiet hours', () => {
    const now = at(2026, 5, 30, 9, 0);
    const ts = nextReminderTrigger(now, '23:30', quietOn); // inside 22:00–07:00
    expect(new Date(ts).getHours()).toBe(7); // pushed to 07:00
    expect(new Date(ts).getMinutes()).toBe(0);
  });

  it('ignores quiet hours when disabled', () => {
    const now = at(2026, 5, 30, 9, 0);
    const ts = nextReminderTrigger(now, '23:30', { ...quietOn, enabled: false });
    expect(new Date(ts).getHours()).toBe(23);
    expect(new Date(ts).getMinutes()).toBe(30);
  });
});
