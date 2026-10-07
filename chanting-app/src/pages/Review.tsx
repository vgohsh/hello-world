import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { PageTitle } from '../components/PageTitle'
import { Tib } from '../components/Tib'
import { getText, TEXTS } from '../lib/content'
import { db, type SrsCard } from '../lib/db'
import { useSettings } from '../lib/settings'
import { review, type Grade } from '../lib/srs'
import { speak } from '../lib/speak'
import { useLang } from '../lib/useLang'

const GRADES: Grade[] = ['again', 'hard', 'good', 'easy']

export default function Review() {
  const { t } = useTranslation()
  const { L, lang } = useLang()
  const { settings } = useSettings()
  const [now] = useState(() => Date.now())
  const [shown, setShown] = useState(false)
  const [doneCount, setDoneCount] = useState(0)
  const cards = useLiveQuery(() => db.srs.toArray().catch(() => [] as SrsCard[]), [], null)
  if (cards === null) return null

  const due = cards.filter((c) => c.due <= Math.max(now, Date.now() - 1)).sort((a, b) => a.due - b.due)
  const card = due[0]

  if (!cards.length)
    return (
      <div>
        <PageTitle>{t('review.title')}</PageTitle>
        <p className="mb-4">{t('review.empty')}</p>
        <ul className="space-y-2">
          {TEXTS.map((x) => (
            <li key={x.id}><Link className="btn" to={`/text/${x.id}/memorize`}>{x.title[lang]}</Link></li>
          ))}
        </ul>
      </div>
    )

  if (!card) {
    const next = Math.min(...cards.map((c) => c.due))
    return (
      <div>
        <PageTitle>{t('review.title')}</PageTitle>
        <div className="card p-6 text-center">
          <p className="text-2xl">🙏</p>
          <p className="font-semibold">{t('review.allDone', { count: doneCount })}</p>
          <p className="text-muted">{t('review.nextDue', { when: new Date(next).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en') })}</p>
        </div>
      </div>
    )
  }

  const text = getText(card.textId)
  const idx = text?.phrases.findIndex((p) => p.id === card.phraseId) ?? -1
  if (!text || idx < 0) {
    void db.srs.delete([card.textId, card.phraseId] as never)
    return null
  }
  const phrase = text.phrases[idx]
  const prev = text.phrases[idx - 1]

  const grade = async (g: Grade) => {
    await db.srs.put(review(card, g))
    setShown(false)
    setDoneCount((n) => n + 1)
  }

  return (
    <div className="space-y-4">
      <PageTitle sub={t('review.dueCount', { count: due.length })}>{t('review.title')}</PageTitle>
      <article className="card space-y-3 p-5">
        <p className="text-sm text-muted">{text.title[lang]} · {t('reader.phraseN', { n: idx + 1 })}</p>
        <p className="text-lg">{t('review.cue')}: <strong>{L(phrase.gloss)}</strong></p>
        {prev && <p className="text-sm text-muted">{t('review.after')}: {prev.phon[settings.tradition]}</p>}
        {shown ? (
          <div className="rounded-lg bg-surface-2 p-3" data-testid="answer">
            <Tib>{phrase.tib}</Tib>
            <p className="text-lg font-medium">{phrase.phon[settings.tradition]}</p>
            <button type="button" className="btn mt-2 text-sm" onClick={() => speak(phrase.phon[settings.tradition])}>▶ {t('review.listen')}</button>
          </div>
        ) : (
          <button type="button" className="btn btn-primary w-full" onClick={() => setShown(true)}>{t('review.show')}</button>
        )}
        {shown && (
          <div role="group" aria-label={t('review.howWell')} className="grid grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <button key={g} type="button" className="btn flex-col px-1 text-sm" onClick={() => void grade(g)}>
                {t(`review.${g}`)}
                <span className="text-xs text-muted">{fmtInterval(review(card, g).interval, t)}</span>
              </button>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}

function fmtInterval(days: number, t: TFunction) {
  if (days === 0) return t('review.minutes', { count: 10 })
  return t('review.days', { count: days })
}
