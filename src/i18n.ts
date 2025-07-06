import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import de from './locales/de/translation.json';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: 'en',
    resources: {
      en: {
        translation: en,
      },
      de: {
        translation: de,
      },
    },
    interpolation: {
      escapeValue: false, // React already does escaping
      format: (value, format, lng, options) => {
        // Allow nested translations for summary generation
        if (format === 'nested' && value && value.key) {
          return i18next.t(value.key, { ...value.values, ...options, ns: 'translation' });
        }
        return value;
      }
    },
  });

export default i18next;
