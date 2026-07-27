import { getLocales } from 'react-native-localize';
import { storage } from '@shared/lib/storage/mmkv';

export type AppLanguage = 'uz' | 'ru';

export const SUPPORTED_LANGUAGES: AppLanguage[] = ['uz', 'ru'];

const KEY = 'app.language';

export function isSupportedLanguage(v: string | undefined | null): v is AppLanguage {
  return v === 'uz' || v === 'ru';
}

/**
 * Ishlatiladigan til: saqlangan tanlov > qurilma tili > `uz`.
 * Bu fayl ataylab `i18n.ts` ni import qilmaydi (aylanma bog'liqlik bo'lmasin) —
 * til almashtirish `setLanguage` orqali `i18n.ts` da.
 */
export function resolveInitialLanguage(): AppLanguage {
  const stored = storage.getString(KEY);
  if (isSupportedLanguage(stored)) return stored;
  const device = getLocales()[0]?.languageCode;
  return isSupportedLanguage(device) ? device : 'uz';
}

/** Tanlovni diskka yozadi (qo'llash — `setLanguage`). */
export function storeLanguage(lng: AppLanguage): void {
  storage.set(KEY, lng);
}
