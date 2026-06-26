import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import uz from './locales/uz.json';

const SUPPORTED = ['uz'];
const deviceLang = getLocales()[0]?.languageCode;
const lng = deviceLang && SUPPORTED.includes(deviceLang) ? deviceLang : 'uz';

i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz } },
  lng,
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
