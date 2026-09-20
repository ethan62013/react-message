import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANG_STORAGE_KEY, type AppLanguage } from './constants'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'

export { LANG_STORAGE_KEY } from './constants'
export type { AppLanguage } from './constants'

export const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
} as const

function readStoredLanguage(): AppLanguage {
  return localStorage.getItem(LANG_STORAGE_KEY) === 'en-US' ? 'en-US' : 'zh-CN'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage(),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
})

export default i18n
