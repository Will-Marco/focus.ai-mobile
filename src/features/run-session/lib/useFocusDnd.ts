import { useEffect } from 'react';
import { storage } from '@shared/lib/storage/mmkv';
import { focusDnd } from './focusDnd';

const DND_ASKED_KEY = 'dnd-permission-asked';

/**
 * Faol sessiya davomida tizim DND'ni yoqadi, tugaganда o'chiradi.
 * Ruxsat berilmagan bo'lsa — birinchi marta bir martagina tizim sozlamasini
 * ochib so'raydi (MMKV flag bilan; keyin qayta bezovta qilmaydi). Ruxsat yo'q
 * bo'lsa tizim DND ishlamaydi, lekin in-app immersiv rejim (Away/Focus Clock) qoladi.
 */
export function useFocusDnd(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      const available = await focusDnd.isAvailable();
      if (!available || cancelled) return;

      const granted = await focusDnd.hasPermission();
      if (cancelled) return;

      if (!granted) {
        const asked = storage.getBoolean(DND_ASKED_KEY) ?? false;
        if (!asked) {
          storage.set(DND_ASKED_KEY, true);
          await focusDnd.requestPermission();
        }
        return; // ruxsatsiz yoqib bo'lmaydi
      }

      if (!cancelled) await focusDnd.setEnabled(true);
    })();

    return () => {
      cancelled = true;
      focusDnd.setEnabled(false).catch(() => {});
    };
  }, [enabled]);
}
