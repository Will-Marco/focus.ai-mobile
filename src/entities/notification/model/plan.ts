// Bildirishnoma rejasi — sof (pure): settings + now → rejalashtiriladigan spec'lar.
// App qatlami bu rejani Notifee wrapper orqali qo'llaydi (boundary toza).
import { parseHm } from '../lib/quietHours';
import { nextReminderTrigger, nextWeeklyAtMinute } from '../lib/schedule';
import type { NotificationSettings } from './types';

export interface ScheduleSpec {
  id: string;
  timestamp: number;
  title: string;
  body: string;
  repeat: 'daily' | 'weekly';
}

// Lokalizatsiyalangan matnlar (app qatlamidan t() bilan beriladi).
export interface NotifStrings {
  reminderTitle: string;
  reminderBody: string;
  streakTitle: string;
  streakBody: string;
  weeklyTitle: string;
  weeklyBody: string;
}

export const NOTIF_ID = {
  reminder: 'reminder-daily',
  streak: 'streak-daily',
  weekly: 'weekly-ai',
} as const;

const SUNDAY = 0;
const WEEKLY_MINUTE = 20 * 60; // Yakshanba 20:00

/** Joriy sozlamalarга ko'ra rejalashtiriladigan barcha bildirishnomalar. */
export function buildNotificationPlan(
  nowMs: number,
  s: NotificationSettings,
  str: NotifStrings,
): ScheduleSpec[] {
  const quiet = { enabled: s.quietEnabled, start: s.quietStart, end: s.quietEnd };
  const specs: ScheduleSpec[] = [];

  if (s.toggles.reminder) {
    specs.push({
      id: NOTIF_ID.reminder,
      timestamp: nextReminderTrigger(nowMs, s.reminderTime, quiet),
      title: str.reminderTitle,
      body: str.reminderBody,
      repeat: 'daily',
    });
  }

  if (s.toggles.streak) {
    specs.push({
      id: NOTIF_ID.streak,
      timestamp: nextReminderTrigger(nowMs, s.streakTime, quiet),
      title: str.streakTitle,
      body: str.streakBody,
      repeat: 'daily',
    });
  }

  if (s.toggles.weekly) {
    specs.push({
      id: NOTIF_ID.weekly,
      timestamp: nextWeeklyAtMinute(nowMs, SUNDAY, WEEKLY_MINUTE),
      title: str.weeklyTitle,
      body: str.weeklyBody,
      repeat: 'weekly',
    });
  }

  return specs;
}

// remainder uchun parseHm re-export qulaylik (UI vaqt validatsiyasi).
export { parseHm };
