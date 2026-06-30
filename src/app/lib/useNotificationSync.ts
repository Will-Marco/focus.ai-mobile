import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { buildNotificationPlan, useNotificationStore, type NotifStrings } from '@entities/notification';
import { cancelAll, ensureChannels, requestPermission, scheduleAt } from '@shared/lib/notifications';

/**
 * Bildirishnoma jadvalini sozlamalarга reaktiv sinxronlaydi.
 * Mount'da: ruxsat + kanallar. Har sozlama o'zgarishida: barchasini bekor qilib qayta rejalashtirish.
 * Notifee mavjud bo'lmasa (jest/build'gacha) — barchasi xavfsiz no-op.
 */
export function useNotificationSync() {
  const { t } = useTranslation();
  const settings = useNotificationStore((s) => s.settings);
  const initRef = useRef(false);

  // Bir martalik init: ruxsat + kanallar.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      await requestPermission();
      await ensureChannels();
    })();
  }, []);

  // Sozlama har o'zgarganda jadvalni qayta qurish.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const str: NotifStrings = {
        reminderTitle: t('notif.push.reminderTitle'),
        reminderBody: t('notif.push.reminderBody'),
        streakTitle: t('notif.push.streakTitle'),
        streakBody: t('notif.push.streakBody'),
        weeklyTitle: t('notif.push.weeklyTitle'),
        weeklyBody: t('notif.push.weeklyBody'),
      };
      const plan = buildNotificationPlan(Date.now(), settings, str);
      await cancelAll();
      if (cancelled) return;
      for (const spec of plan) {
        await scheduleAt({ id: spec.id, timestamp: spec.timestamp, title: spec.title, body: spec.body, repeat: spec.repeat });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [settings, t]);
}
