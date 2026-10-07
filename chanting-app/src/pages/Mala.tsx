import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MalaCounter } from '../components/MalaCounter'
import { PageTitle } from '../components/PageTitle'
import { MANTRAS } from '../lib/useMantras'
import { useLang } from '../lib/useLang'

export const TARGETS = [21, 108]

export default function Mala() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [textId, setTextId] = useState(MANTRAS.find((m) => m.id === 'vajrasattva')?.id ?? MANTRAS[0].id)
  const [target, setTarget] = useState(108)
  const [custom, setCustom] = useState('')
  return (
    <div className="space-y-4">
      <PageTitle back="/practice" sub={t('mala.desc')}>{t('mala.title')}</PageTitle>
      <label className="block text-sm">
        <span className="text-muted">{t('mala.mantra')}</span>
        <select className="btn mt-1 w-full justify-start" value={textId} onChange={(e) => setTextId(e.target.value)}>
          {MANTRAS.map((m) => <option key={m.id} value={m.id}>{m.title[lang]}</option>)}
        </select>
      </label>
      <div role="group" aria-label={t('mala.target')} className="flex flex-wrap items-center gap-2">
        {TARGETS.map((n) => (
          <button key={n} type="button" className="btn" aria-pressed={target === n} onClick={() => setTarget(n)}>{n}</button>
        ))}
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            const n = Number(custom)
            if (n > 0 && n <= 100000) setTarget(Math.floor(n))
          }}
        >
          <input type="number" min={1} max={100000} inputMode="numeric" placeholder={t('mala.custom')} aria-label={t('mala.custom')}
            className="w-24 rounded-full border border-line bg-surface px-3 py-2" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <button type="submit" className="btn">{t('common.set')}</button>
        </form>
      </div>
      <MalaCounter textId={textId} target={target} />
    </div>
  )
}
