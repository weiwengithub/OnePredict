import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en.json';
import zh from '../locales/zh.json';
import zhtw from '../locales/zhtw.json';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  },
  zhtw: {
    translation: zhtw
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',


    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

const t= i18n.t

export default i18n;
