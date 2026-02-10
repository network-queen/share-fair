import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enLocale from './locales/en.json';
import ukLocale from './locales/uk.json';

const resources = {
  en: {
    translation: enLocale,
  },
  uk: {
    translation: ukLocale,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
