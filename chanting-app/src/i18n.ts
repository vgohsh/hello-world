import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zh from './locales/zh-Hans.json'
import { loadSettings } from './lib/settingsStore'

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh } },
  lng: loadSettings().lang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
