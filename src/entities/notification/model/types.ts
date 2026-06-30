// Bildirishnoma sozlamalari — MMKV'da local persist (login'siz).
export type NotifToggleKey = 'reminder' | 'achieve' | 'streak' | 'team' | 'weekly';

export interface NotificationSettings {
  /** Har turdagi bildirishnoma yoniq/o'chiq. */
  toggles: Record<NotifToggleKey, boolean>;
  /** Kunlik odat eslatmasi vaqti "HH:MM" (lokal). */
  reminderTime: string;
  /** Streak xavfi eslatmasi vaqti "HH:MM" (kech, kun yopilishidan oldin). */
  streakTime: string;
  /** Tinch soatlar yoniqmi. */
  quietEnabled: boolean;
  /** Tinch soatlar boshlanishi "HH:MM" (tunги bo'lishi mumkin). */
  quietStart: string;
  /** Tinch soatlar tugashi "HH:MM" (ertalabki). */
  quietEnd: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  toggles: { reminder: true, achieve: true, streak: true, team: false, weekly: true },
  reminderTime: '21:00',
  streakTime: '20:00',
  quietEnabled: true,
  quietStart: '22:00',
  quietEnd: '07:00',
};
