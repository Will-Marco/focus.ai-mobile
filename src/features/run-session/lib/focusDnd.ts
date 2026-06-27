import { NativeModules, Platform } from 'react-native';

/**
 * Native Android DND ko'prigi (NotificationManager.setInterruptionFilter).
 * iOS'да yo'q (tizim DND'ni dasturiy boshqarib bo'lmaydi) — in-app immersiv rejim qoladi.
 * Modul yo'q / ruxsat yo'q bo'lsa hamma metod jim no-op qaytaradi (crash yo'q).
 */
interface FocusDndNative {
  isAvailable(): Promise<boolean>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  setEnabled(enabled: boolean): Promise<boolean>;
}

const native: FocusDndNative | undefined =
  Platform.OS === 'android'
    ? (NativeModules.FocusDnd as FocusDndNative | undefined)
    : undefined;

export const focusDnd = {
  async isAvailable(): Promise<boolean> {
    try {
      return (await native?.isAvailable()) ?? false;
    } catch {
      return false;
    }
  },
  async hasPermission(): Promise<boolean> {
    try {
      return (await native?.hasPermission()) ?? false;
    } catch {
      return false;
    }
  },
  /** Tizim sozlamalarini ochadi (DND access). */
  async requestPermission(): Promise<void> {
    try {
      await native?.requestPermission();
    } catch {
      // ignore
    }
  },
  async setEnabled(enabled: boolean): Promise<boolean> {
    try {
      return (await native?.setEnabled(enabled)) ?? false;
    } catch {
      return false;
    }
  },
};
