import { create } from 'zustand';
import { notificationSettingsStorage } from './settingsStorage';
import { DEFAULT_NOTIFICATION_SETTINGS, type NotifToggleKey, type NotificationSettings } from './types';

interface NotificationState {
  settings: NotificationSettings;
  hydrate: () => void;
  toggle: (key: NotifToggleKey) => void;
  setQuietEnabled: (value: boolean) => void;
  setQuietStart: (value: string) => void;
  setQuietEnd: (value: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  const persist = (settings: NotificationSettings) => {
    notificationSettingsStorage.save(settings);
    set({ settings });
  };

  return {
    settings: DEFAULT_NOTIFICATION_SETTINGS,

    hydrate: () => set({ settings: notificationSettingsStorage.get() }),

    toggle: (key) => {
      const s = get().settings;
      persist({ ...s, toggles: { ...s.toggles, [key]: !s.toggles[key] } });
    },

    setQuietEnabled: (value) => persist({ ...get().settings, quietEnabled: value }),
    setQuietStart: (value) => persist({ ...get().settings, quietStart: value }),
    setQuietEnd: (value) => persist({ ...get().settings, quietEnd: value }),
  };
});
