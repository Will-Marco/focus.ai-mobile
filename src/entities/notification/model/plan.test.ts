import { buildNotificationPlan, NOTIF_ID, type NotifStrings } from './plan';
import { DEFAULT_NOTIFICATION_SETTINGS } from './types';

const STR: NotifStrings = {
  reminderTitle: 'r',
  reminderBody: 'rb',
  streakTitle: 's',
  streakBody: 'sb',
  weeklyTitle: 'w',
  weeklyBody: 'wb',
};
const now = new Date(2026, 5, 30, 9, 0, 0, 0).getTime(); // Tue 09:00

describe('buildNotificationPlan', () => {
  it('schedules reminder + streak + weekly when all toggled on', () => {
    const plan = buildNotificationPlan(now, DEFAULT_NOTIFICATION_SETTINGS, STR);
    const ids = plan.map((p) => p.id);
    expect(ids).toEqual([NOTIF_ID.reminder, NOTIF_ID.streak, NOTIF_ID.weekly]);
  });

  it('omits a notification when its toggle is off', () => {
    const s = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      toggles: { ...DEFAULT_NOTIFICATION_SETTINGS.toggles, reminder: false, weekly: false },
    };
    const plan = buildNotificationPlan(now, s, STR);
    expect(plan.map((p) => p.id)).toEqual([NOTIF_ID.streak]);
  });

  it('marks daily vs weekly repeat correctly', () => {
    const plan = buildNotificationPlan(now, DEFAULT_NOTIFICATION_SETTINGS, STR);
    expect(plan.find((p) => p.id === NOTIF_ID.reminder)?.repeat).toBe('daily');
    expect(plan.find((p) => p.id === NOTIF_ID.weekly)?.repeat).toBe('weekly');
  });

  it('produces future timestamps', () => {
    const plan = buildNotificationPlan(now, DEFAULT_NOTIFICATION_SETTINGS, STR);
    for (const spec of plan) expect(spec.timestamp).toBeGreaterThan(now);
  });
});
