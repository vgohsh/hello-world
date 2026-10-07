import { useTranslation } from 'react-i18next'
import { useSettings } from '../lib/settings'

export function LangToggle() {
  const { settings, update } = useSettings()
  const { t } = useTranslation()
  return (
    <div role="group" aria-label={t('settings.language')} className="flex rounded-full border border-line bg-surface p-0.5 text-sm">
      {(['en', 'zh'] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l === 'zh' ? 'zh-Hans' : 'en'}
          aria-pressed={settings.lang === l}
          onClick={() => update({ lang: l })}
          className={`min-h-9 min-w-11 rounded-full px-3 ${settings.lang === l ? 'bg-accent text-accent-ink' : 'text-muted'}`}
        >
          {l === 'en' ? 'EN' : '中文'}
        </button>
      ))}
    </div>
  )
}
