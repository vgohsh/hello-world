import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UnverifiedBadge } from '../components/Badges'
import { MalaCounter } from '../components/MalaCounter'
import { PageTitle } from '../components/PageTitle'
import { Tib } from '../components/Tib'
import { DEDICATION, REFUGE, type Prayer } from '../content/prayers'
import { MANTRAS } from '../lib/useMantras'
import { useLang } from '../lib/useLang'

type Step = 'setup' | 'refuge' | 'mantra' | 'dedication' | 'done'

export default function Session() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [step, setStep] = useState<Step>('setup')
  const [textId, setTextId] = useState('vajrasattva')
  const [count, setCount] = useState(21)
  const [started, setStarted] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (step === 'setup' || step === 'done') return
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(id)
  }, [step, started])

  const mm = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`
  const mantra = MANTRAS.find((m) => m.id === textId) ?? MANTRAS[0]

  return (
    <div className="space-y-4">
      <PageTitle back="/practice" sub={step !== 'setup' ? `⏱ ${mm}` : t('session.desc')}>{t('session.title')}</PageTitle>
      {step !== 'setup' && step !== 'done' && (
        <ol className="flex gap-2 text-sm" aria-label={t('session.steps')}>
          {(['refuge', 'mantra', 'dedication'] as const).map((s, i) => (
            <li key={s} aria-current={step === s ? 'step' : undefined} className={`flex-1 rounded-full border px-2 py-1 text-center ${step === s ? 'border-saffron bg-highlight font-semibold' : 'border-line text-muted'}`}>
              {i + 1}. {t(`session.${s}`)}
            </li>
          ))}
        </ol>
      )}

      {step === 'setup' && (
        <div className="card space-y-3 p-4">
          <label className="block text-sm">
            <span className="text-muted">{t('mala.mantra')}</span>
            <select className="btn mt-1 w-full justify-start" value={textId} onChange={(e) => setTextId(e.target.value)}>
              {MANTRAS.map((m) => <option key={m.id} value={m.id}>{m.title[lang]}</option>)}
            </select>
          </label>
          <div role="group" aria-label={t('session.count')} className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">{t('session.count')}:</span>
            {[7, 21, 108].map((n) => (
              <button key={n} type="button" className="btn" aria-pressed={count === n} onClick={() => setCount(n)}>{n}</button>
            ))}
          </div>
          <button type="button" className="btn btn-primary w-full" onClick={() => { setStarted(Date.now()); setElapsed(0); setStep('refuge') }}>
            {t('session.begin')}
          </button>
        </div>
      )}

      {step === 'refuge' && <PrayerStep prayer={REFUGE} title={t('session.refugeTitle')} onNext={() => setStep('mantra')} />}

      {step === 'mantra' && (
        <div className="space-y-3">
          <p>{t('session.mantraHint', { count, title: mantra.title[lang] })}</p>
          <MalaCounter textId={mantra.id} target={count} onRound={() => setStep('dedication')} />
          <button type="button" className="btn w-full" onClick={() => setStep('dedication')}>{t('session.skip')}</button>
        </div>
      )}

      {step === 'dedication' && <PrayerStep prayer={DEDICATION} title={t('session.dedicationTitle')} onNext={() => setStep('done')} />}

      {step === 'done' && (
        <div className="card p-6 text-center">
          <p className="text-3xl">🙏</p>
          <p className="font-semibold">{t('session.done', { time: mm })}</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => setStep('setup')}>{t('session.again')}</button>
        </div>
      )}
    </div>
  )
}

function PrayerStep({ prayer, title, onNext }: { prayer: Prayer; title: string; onNext: () => void }) {
  const { t } = useTranslation()
  const { L } = useLang()
  return (
    <article className="card space-y-3 p-4">
      <h2 className="font-semibold">{title}</h2>
      <Tib>{prayer.tib}</Tib>
      <p className="italic text-muted">{prayer.phon}</p>
      <p>{L(prayer.translation)}</p>
      <UnverifiedBadge />
      <button type="button" className="btn btn-primary w-full" onClick={onNext}>{t('common.next')}</button>
    </article>
  )
}
