import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations (if any exist)
const resources = {
  en: {
    translation: {
      // Add your English translations here
      welcome: 'Welcome to Kometa',
      dashboard: 'Dashboard',
      collections: 'Collections',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      configuration: 'Configuration',
      operations: 'Operations',
      logs: 'Logs',
      scheduler: 'Scheduler',
      overlay_editor: 'Overlay Editor',
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    debug: false,
  });

export default i18n;
