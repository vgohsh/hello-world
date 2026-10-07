import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import i18n from '../i18n'
import { loadSettings, saveSettings, type Settings } from './settingsStore'


type Ctx = { settings: Settings; update: (patch: Partial<Settings>) => void }
const SettingsContext = createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    saveSettings(settings)
    const html = document.documentElement
    html.lang = settings.lang === 'zh' ? 'zh-Hans' : 'en'
    if (i18n.language !== settings.lang) void i18n.changeLanguage(settings.lang)
    document.title = i18n.t('app.name', { lng: settings.lang })
    html.dataset.fontSize = settings.fontSize
  }, [settings])

  useEffect(() => {
    const html = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && mq.matches)
      html.classList.toggle('dark', dark)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme])

  const value = useMemo<Ctx>(
    () => ({ settings, update: (patch) => setSettings((s) => ({ ...s, ...patch })) }),
    [settings],
  )
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings outside SettingsProvider')
  return ctx
}
