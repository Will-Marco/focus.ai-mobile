import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isSupportedLanguage, resolveInitialLanguage, storeLanguage, type AppLanguage } from './language';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
  },
  lng: resolveInitialLanguage(),
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
  returnNull: false,
  // Statistika yorliqlari (hafta kunlari, oylar) massiv sifatida saqlanadi.
  returnObjects: true,
});

/** Tilni almashtiradi: diskka yozadi + darhol qo'llaydi (UI `useTranslation` orqali yangilanadi). */
export function setLanguage(lng: AppLanguage): void {
  storeLanguage(lng);
  i18n.changeLanguage(lng).catch(() => {
    // i18next resurslari lokal — amalda rad etilmaydi; UI baribir eski tilda qoladi.
  });
}

/** Hozir faol til. */
export function getLanguage(): AppLanguage {
  return isSupportedLanguage(i18n.language) ? i18n.language : 'uz';
}

export default i18n;
