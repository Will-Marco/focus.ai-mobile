/**
 * Haptic feedback wrapper (nitro-haptics) — semantik metodlar + xavfsiz no-op.
 *
 * Lazy: nitro-haptics index'i import paytida `createHybridObject` chaqiradi —
 * native ro'yxatga olinmaган bo'lsa (jest yoki rebuild'gacha) crash beradi.
 * Shu sabab modulni faqat birinchi ishlatishда try/catch bilan yuklaymiz.
 */

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
type NotificationType = 'success' | 'warning' | 'error';

interface HapticsNative {
  impact(style: ImpactStyle): void;
  notification(type: NotificationType): void;
  selection(): void;
}

let native: HapticsNative | null | undefined;

// Global vibratsiya o'chirilgan (Sir talabi). Yoqish uchun `true` qiling.
const HAPTICS_ENABLED = false;

function get(): HapticsNative | null {
  if (!HAPTICS_ENABLED) return null;
  if (native !== undefined) return native;
  try {
    native = require('react-native-nitro-haptics').Haptics as HapticsNative;
  } catch {
    native = null;
  }
  return native;
}

function safeImpact(style: ImpactStyle): void {
  try {
    get()?.impact(style);
  } catch {
    // ignore
  }
}

function safeNotification(type: NotificationType): void {
  try {
    get()?.notification(type);
  } catch {
    // ignore
  }
}

export const haptics = {
  /** Yengil teginish — tugma, FAB, oddiy harakatlar. */
  light: () => safeImpact('light'),
  /** O'rta — sessiya boshlash/yakunlash, away trigger. */
  medium: () => safeImpact('medium'),
  /** Kuchli — muhim tasdiq. */
  heavy: () => safeImpact('heavy'),
  /** Tanlash tiki — chip, segmented, rang tanlash. */
  selection: () => {
    try {
      get()?.selection();
    } catch {
      // ignore
    }
  },
  /** Yutuq — 100% maqsadga yetish, saqlash. */
  success: () => safeNotification('success'),
  /** Ogohlantirish — o'chirish kabi. */
  warning: () => safeNotification('warning'),
  /** Xato. */
  error: () => safeNotification('error'),
};
