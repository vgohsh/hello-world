export type Lang = 'en' | 'zh'
export type Settings = {
  lang: Lang
  tradition: 'tibetan' | 'sanskrit'
  zhPhonStyle: 'hanzi' | 'pinyin' | 'both'
  show: { tib: boolean; phon: boolean; iast: boolean; meaning: boolean; zhPhon: boolean | null }
  fontSize: 'md' | 'lg' | 'xl'
  theme: 'system' | 'light' | 'dark'
  reminder: { enabled: boolean; time: string }
}

export const DEFAULT_SETTINGS: Settings = {
  lang: 'en',
  tradition: 'tibetan',
  zhPhonStyle: 'both',
  // zhPhon null = automatic: on in Chinese mode, off in English mode
  show: { tib: true, phon: true, iast: false, meaning: true, zhPhon: null },
  fontSize: 'lg',
  theme: 'system',
  reminder: { enabled: false, time: '07:00' },
}

const KEY = 'chant.settings.v1'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    const s = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...s, show: { ...DEFAULT_SETTINGS.show, ...s.show }, reminder: { ...DEFAULT_SETTINGS.reminder, ...s.reminder } }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable: settings last for this visit only */
  }
}

export function showZhPhon(s: Settings): boolean {
  return s.show.zhPhon ?? s.lang === 'zh'
}
