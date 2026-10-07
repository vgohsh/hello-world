import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageTitle } from '../components/PageTitle'
import { db } from '../lib/db'
import { useSettings } from '../lib/settings'
import type { Settings } from '../lib/settingsStore'

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.v} type="button" className="btn" aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.label}</button>
        ))}
      </div>
    </fieldset>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { settings, update } = useSettings()
  const [notice, setNotice] = useState<string | null>(null)
  const zhMode = settings.show.zhPhon === null ? 'auto' : settings.show.zhPhon ? 'on' : 'off'

  const toggleReminder = async (enabled: boolean) => {
    if (enabled) {
      if (typeof Notification === 'undefined') return setNotice(t('settings.notifUnsupported'))
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return setNotice(t('settings.notifDenied'))
    }
    setNotice(null)
    update({ reminder: { ...settings.reminder, enabled } })
  }

  const clearAll = async () => {
    if (!window.confirm(t('settings.clearConfirm'))) return
    await db.delete()
    try {
      localStorage.clear()
    } catch {
      /* ignore */
    }
    location.href = '/'
  }

  return (
    <div className="space-y-6">
      <PageTitle>{t('settings.title')}</PageTitle>
      <section className="card space-y-4 p-4">
        <Choice<Settings['lang']> label={t('settings.language')} value={settings.lang} onChange={(lang) => update({ lang })}
          options={[{ v: 'en', label: <span lang="en">English</span> }, { v: 'zh', label: <span lang="zh-Hans">简体中文</span> }]} />
        <Choice<Settings['tradition']> label={t('settings.tradition')} value={settings.tradition} onChange={(tradition) => update({ tradition })}
          options={[{ v: 'tibetan', label: t('settings.tibetan') }, { v: 'sanskrit', label: t('settings.sanskrit') }]} />
        <p className="text-sm text-muted">{t('settings.traditionHint')}</p>
        <Choice label={t('settings.zhPhon')} value={zhMode} onChange={(v) => update({ show: { ...settings.show, zhPhon: v === 'auto' ? null : v === 'on' } })}
          options={[{ v: 'auto', label: t('settings.zhPhonAuto') }, { v: 'on', label: t('common.on') }, { v: 'off', label: t('common.off') }]} />
        <Choice<Settings['zhPhonStyle']> label={t('settings.zhPhonStyle')} value={settings.zhPhonStyle} onChange={(zhPhonStyle) => update({ zhPhonStyle })}
          options={[{ v: 'hanzi', label: '汉字' }, { v: 'pinyin', label: 'pinyin' }, { v: 'both', label: t('settings.both') }]} />
      </section>

      <section className="card space-y-4 p-4">
        <Choice<Settings['fontSize']> label={t('settings.fontSize')} value={settings.fontSize} onChange={(fontSize) => update({ fontSize })}
          options={[{ v: 'md', label: t('settings.medium') }, { v: 'lg', label: t('settings.large') }, { v: 'xl', label: t('settings.xlarge') }]} />
        <p lang="bo" className="tib">ཨོཾ་བཛྲ་སཏྭ་ཧཱུྃ།</p>
        <Choice<Settings['theme']> label={t('settings.theme')} value={settings.theme} onChange={(theme) => update({ theme })}
          options={[{ v: 'system', label: t('settings.system') }, { v: 'light', label: t('settings.light') }, { v: 'dark', label: t('settings.dark') }]} />
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">{t('settings.reminder')}</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5" checked={settings.reminder.enabled} onChange={(e) => void toggleReminder(e.target.checked)} />
          {t('settings.reminderEnable')}
        </label>
        <label className="flex items-center gap-3">
          {t('settings.reminderTime')}
          <input type="time" className="rounded-lg border border-line bg-surface px-2 py-1" value={settings.reminder.time}
            onChange={(e) => update({ reminder: { ...settings.reminder, time: e.target.value } })} />
        </label>
        <p className="text-sm text-muted">{t('settings.reminderNote')}</p>
        {notice && <p role="alert" className="text-sm text-warn">{notice}</p>}
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">{t('settings.tools')}</h2>
        <Link to="/tools/align" className="btn">🎚 {t('align.title')}</Link>
        <p className="text-sm text-muted">{t('settings.toolsHint')}</p>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">{t('settings.about')}</h2>
        <p className="text-sm">{t('settings.aboutBody')}</p>
        <button type="button" className="btn border-warn text-warn" onClick={() => void clearAll()}>{t('settings.clear')}</button>
      </section>
    </div>
  )
}
