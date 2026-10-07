import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Tib } from '../components/Tib'
import { TEXTS } from '../lib/content'
import { db } from '../lib/db'
import { useLang } from '../lib/useLang'

export default function Home() {
  const { t } = useTranslation()
  const { L, lang } = useLang()
  const cards = useLiveQuery(() => db.srs.toArray().catch(() => []), [], [])
  const now = Date.now()
  const due = cards.filter((c) => c.due <= now).length

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
        <p className="text-muted">{t('home.intro')}</p>
      </section>

      {due > 0 && (
        <Link to="/review" className="card flex items-center justify-between border-saffron p-4">
          <span>🔁 {t('home.due', { count: due })}</span>
          <span className="btn btn-primary">{t('home.reviewNow')}</span>
        </Link>
      )}

      <section aria-labelledby="texts-h">
        <h2 id="texts-h" className="mb-2 text-lg font-semibold">{t('home.texts')}</h2>
        <ul className="space-y-3">
          {TEXTS.map((text) => {
            const learned = cards.filter((c) => c.textId === text.id && c.reps > 0).length
            const pct = Math.round((learned / text.phrases.length) * 100)
            return (
              <li key={text.id}>
                <Link to={`/text/${text.id}`} className="card block p-4 transition hover:border-saffron">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{text.title[lang]}</h3>
                      <Tib className="text-lg!">{text.title.bo}</Tib>
                    </div>
                    {!text.verified && <span className="shrink-0 rounded-full bg-warn/10 px-2 py-0.5 text-xs text-warn">{t('badge.unverifiedShort')}</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{L(text.description)}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('home.progress')}>
                      <div className="h-full bg-saffron" style={{ width: `${pct}%` }} />
                    </div>
                    <span>{t('home.learned', { learned, total: text.phrases.length })}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="script-h">
        <h2 id="script-h" className="mb-2 text-lg font-semibold">{t('home.script')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/learn/alphabet" className="card p-4">
            <Tib className="text-2xl!">ཀ་ཁ་ག་ང</Tib>
            <p className="font-medium">{t('alphabet.title')}</p>
          </Link>
          <Link to="/learn/anatomy" className="card p-4">
            <Tib className="text-2xl!">བསྒྲུབས</Tib>
            <p className="font-medium">{t('anatomy.title')}</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
