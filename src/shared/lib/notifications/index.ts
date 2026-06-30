/**
 * Local bildirishnoma wrapper (Notifee) — xavfsiz, lazy.
 *
 * Notifee native modul; jest'da yoki native rebuild'gacha import paytida
 * crash berishi mumkin. Shu sabab modulni faqat birinchi ishlatishда try/catch
 * bilan yuklaymiz va barcha metodlar no-op fallback'ga ega.
 *
 * Offline-first: hammasi local (server YO'Q). Push M8+ (Supabase) bonus.
 */

export const REMINDER_CHANNEL = 'focus-reminders';
export const EVENT_CHANNEL = 'focus-events';

// Notifee'ning bizga kerakli yuzasi (to'liq tip o'rniga minimal kontrakt).
interface NotifeeModule {
  requestPermission(): Promise<{ authorizationStatus: number }>;
  createChannel(config: Record<string, unknown>): Promise<string>;
  createTriggerNotification(notification: Record<string, unknown>, trigger: Record<string, unknown>): Promise<string>;
  displayNotification(notification: Record<string, unknown>): Promise<string>;
  cancelTriggerNotification(id: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  getTriggerNotificationIds(): Promise<string[]>;
}

interface NotifeeConstants {
  TriggerType: { TIMESTAMP: number };
  RepeatFrequency: { NONE: number; HOURLY: number; DAILY: number; WEEKLY: number };
  AndroidImportance: { HIGH: number; DEFAULT: number };
  AuthorizationStatus: { DENIED: number; AUTHORIZED: number; PROVISIONAL: number };
}

let mod: { notifee: NotifeeModule; c: NotifeeConstants } | null | undefined;

function load(): { notifee: NotifeeModule; c: NotifeeConstants } | null {
  if (mod !== undefined) return mod;
  try {
    const lib = require('@notifee/react-native');
    mod = {
      notifee: (lib.default ?? lib) as NotifeeModule,
      c: {
        TriggerType: lib.TriggerType,
        RepeatFrequency: lib.RepeatFrequency,
        AndroidImportance: lib.AndroidImportance,
        AuthorizationStatus: lib.AuthorizationStatus,
      },
    };
  } catch {
    mod = null;
  }
  return mod;
}

/** Native modul mavjudmi (build qilingan qurilmada). */
export function isNotifeeAvailable(): boolean {
  return load() !== null;
}

/** Ruxsat so'rash — `true` agar berilgan bo'lsa. */
export async function requestPermission(): Promise<boolean> {
  const m = load();
  if (!m) return false;
  try {
    const res = await m.notifee.requestPermission();
    return res.authorizationStatus >= m.c.AuthorizationStatus.AUTHORIZED;
  } catch {
    return false;
  }
}

/** Android kanallarini yaratish (idempotent). */
export async function ensureChannels(): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.notifee.createChannel({ id: REMINDER_CHANNEL, name: 'Eslatmalar', importance: m.c.AndroidImportance.HIGH });
    await m.notifee.createChannel({ id: EVENT_CHANNEL, name: 'Yutuqlar', importance: m.c.AndroidImportance.DEFAULT });
  } catch {
    // ignore
  }
}

export type Repeat = 'daily' | 'weekly' | 'none';

/** Belgilangan vaqtga takrorlanuvchi bildirishnoma rejalashtirish. */
export async function scheduleAt(opts: {
  id: string;
  timestamp: number;
  title: string;
  body: string;
  repeat?: Repeat;
}): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    const repeatFrequency =
      opts.repeat === 'weekly'
        ? m.c.RepeatFrequency.WEEKLY
        : opts.repeat === 'none'
          ? m.c.RepeatFrequency.NONE
          : m.c.RepeatFrequency.DAILY;
    await m.notifee.createTriggerNotification(
      { id: opts.id, title: opts.title, body: opts.body, android: { channelId: REMINDER_CHANNEL, pressAction: { id: 'default' } } },
      { type: m.c.TriggerType.TIMESTAMP, timestamp: opts.timestamp, repeatFrequency },
    );
  } catch {
    // ignore
  }
}

/** Darhol ko'rsatish (yutuq nishonlash, test). */
export async function displayNow(title: string, body: string): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.notifee.displayNotification({ title, body, android: { channelId: EVENT_CHANNEL, pressAction: { id: 'default' } } });
  } catch {
    // ignore
  }
}

/** Bitta rejani bekor qilish. */
export async function cancel(id: string): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.notifee.cancelTriggerNotification(id);
  } catch {
    // ignore
  }
}

/** Barcha rejalashtirilgan bildirishnomalarni bekor qilish. */
export async function cancelAll(): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.notifee.cancelAllNotifications();
  } catch {
    // ignore
  }
}
