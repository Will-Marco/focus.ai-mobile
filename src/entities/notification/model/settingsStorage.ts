import { storage } from '@shared/lib/storage/mmkv';
import { DEFAULT_NOTIFICATION_SETTINGS, type NotificationSettings } from './types';

// Bildirishnoma sozlamalari MMKV'da (login'siz local).
const KEY = 'notification-settings';

export const notificationSettingsStorage = {
  get(): NotificationSettings {
    const raw = storage.getString(KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    try {
      const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
      // Yangi maydonlar qo'shilsa eski saqlovni default bilan to'ldiramiz (forward-safe).
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed,
        toggles: { ...DEFAULT_NOTIFICATION_SETTINGS.toggles, ...parsed.toggles },
      };
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  },

  save(settings: NotificationSettings): void {
    storage.set(KEY, JSON.stringify(settings));
  },
};
