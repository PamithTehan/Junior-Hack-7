import { useLanguage } from '../Contexts/LanguageContext';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const k2 of keys) {
          if (value && value[k2]) {
            value = value[k2];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
};

