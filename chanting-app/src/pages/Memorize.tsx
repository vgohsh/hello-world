import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tib } from '../components/Tib'
import type { Phrase } from '../lib/content'
import { db, getProgress, patchProgress } from '../lib/db'
import { useSettings } from '../lib/settings'
import { newCard } from '../lib/srs'
import { useLang } from '../lib/useLang'
import { useTextCtx } from './TextLayout'

type Mode = 'cloze' | 'chain' | 'memory'

export default function Memorize() {
  const { t } = useTranslation()
  const { text } = useTextCtx()
  const [mode, setMode] = useState<Mode>('cloze')
  const inDeck = useLiveQuery(() => db.srs.where('textId').equals(text.id).count().catch(() => 0), [text.id], 0)

  const addToReview = async () => {
    const existing = new Set((await db.srs.where('textId').equals(text.id).toArray()).map((c) => c.phraseId))
    await db.srs.bulkPut(text.phrases.filter((p) => !existing.has(p.id)).map((p) => newCard(text.id, p.id)))
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
        <span>{inDeck >= text.phrases.length ? `✓ ${t('memorize.inReview')}` : t('memorize.addHint')}</span>
        {inDeck < text.phrases.length && (
          <button type="button" className="btn btn-primary" onClick={() => void addToReview()}>{t('memorize.addToReview')}</button>
        )}
      </div>
      <div role="group" className="flex flex-wrap gap-2">
        {(['cloze', 'chain', 'memory'] as const).map((m) => (
          <button key={m} type="button" className="btn" aria-pressed={mode === m} onClick={() => setMode(m)}>{t(`memorize.${m}`)}</button>
        ))}
      </div>
      {mode === 'cloze' && <Cloze />}
      {mode === 'chain' && <Chain />}
      {mode === 'memory' && <FromMemory />}
    </div>
  )
}

/** Which syllables are hidden at each cloze level. */
export function hiddenAt(level: number, i: number): boolean {
  if (level === 1) return i % 3 === 2
  if (level === 2) return i % 2 === 1
  if (level === 3) return i > 0
  return true
}

function ClozePhrase({ phrase, level, n }: { phrase: Phrase; level: number; n: number }) {
  const { settings } = useSettings()
  const { L } = useLang()
  const { t } = useTranslation()
  const [shown, setShown] = useState<Set<number>>(new Set())
  useEffect(() => setShown(new Set()), [level])
  return (
    <article className="card p-4">
      <p className="mb-1 text-xs text-muted">{t('reader.phraseN', { n })} · {L(phrase.gloss)}</p>
      <div className="flex flex-wrap items-end gap-x-1 gap-y-2">
        {phrase.syllables.map((s, i) => {
          const hidden = hiddenAt(level, i) && !shown.has(i)
          return hidden ? (
            <button
              key={i}
              type="button"
              data-testid="cloze-gap"
              className="flex h-16 min-w-12 items-center justify-center rounded-lg border-2 border-dashed border-line text-muted"
              onClick={() => setShown(new Set(shown).add(i))}
              aria-label={t('memorize.reveal')}
            >
              ?
            </button>
          ) : (
            <span key={i} className="flex flex-col items-center">
              <Tib>{s.tib}</Tib>
              <span className="text-sm">{s.phon[settings.tradition]}</span>
            </span>
          )
        })}
      </div>
    </article>
  )
}

function Cloze() {
  const { t } = useTranslation()
  const { text } = useTextCtx()
  const [level, setLevel] = useState(1)
  const [seed, setSeed] = useState(0)
  return (
    <div className="space-y-3">
      <p className="text-muted">{t('memorize.clozeIntro')}</p>
      <div role="group" aria-label={t('memorize.level')} className="flex flex-wrap items-center gap-2 text-sm">
        {[1, 2, 3, 4].map((l) => (
          <button key={l} type="button" className="btn min-h-9" aria-pressed={level === l} onClick={() => setLevel(l)}>
            {t(`memorize.clozeLevel${l}`)}
          </button>
        ))}
        <button type="button" className="btn min-h-9" onClick={() => setSeed(seed + 1)}>↺ {t('memorize.hideAgain')}</button>
      </div>
      {text.phrases.map((p, i) => <ClozePhrase key={`${p.id}-${seed}`} phrase={p} level={level} n={i + 1} />)}
    </div>
  )
}

function PhraseLine({ phrase, n, hidden }: { phrase: Phrase; n: number; hidden: boolean }) {
  const { settings } = useSettings()
  const { L } = useLang()
  const { t } = useTranslation()
  return (
    <div className={`rounded-lg p-2 ${hidden ? 'bg-surface-2' : ''}`}>
      <p className="text-xs text-muted">{t('reader.phraseN', { n })} · {L(phrase.gloss)}</p>
      {hidden ? (
        <p className="py-2 text-muted">· · ·</p>
      ) : (
        <>
          <Tib>{phrase.tib}</Tib>
          <p className="font-medium">{phrase.phon[settings.tradition]}</p>
        </>
      )}
    </div>
  )
}

function Chain() {
  const { t } = useTranslation()
  const { text, engine } = useTextCtx()
  const n = text.phrases.length
  const [step, setStep] = useState(1)
  const [peek, setPeek] = useState(false)
  useEffect(() => {
    getProgress(text.id).then((p) => setStep(Math.min(n, Math.max(1, p.chainStep || 1)))).catch(() => {})
  }, [text.id, n])
  const go = (s: number) => {
    const v = Math.min(n, Math.max(1, s))
    setStep(v)
    setPeek(false)
    void patchProgress(text.id, { chainStep: v }).catch(() => {})
  }
  return (
    <div className="space-y-3">
      <p className="text-muted">{t('memorize.chainIntro')}</p>
      <div className="card space-y-2 p-4">
        <p className="font-semibold">{t('memorize.chainStep', { step, total: n })}</p>
        {text.phrases.slice(0, step).map((p, i) => (
          <PhraseLine key={p.id} phrase={p} n={i + 1} hidden={i < step - 1 && !peek} />
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="btn" onClick={() => engine?.playPhrases(0, step - 1)}>▶ {t('memorize.listenChain')}</button>
          <button type="button" className="btn" aria-pressed={peek} onClick={() => setPeek(!peek)}>👁 {t('memorize.peek')}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => go(step - 1)} disabled={step <= 1}>← {t('memorize.back')}</button>
          <button type="button" className="btn btn-primary" onClick={() => go(step + 1)} disabled={step >= n}>
            ✓ {t('memorize.gotIt')}
          </button>
        </div>
        {step >= n && <p role="status" className="text-ok">🎉 {t('memorize.chainDone')}</p>}
      </div>
    </div>
  )
}

function FromMemory() {
  const { t } = useTranslation()
  const { text } = useTextCtx()
  const [i, setI] = useState(-1) // -1 = not started
  const [peeking, setPeeking] = useState(false)
  const [peeks, setPeeks] = useState(0)
  const [start, setStart] = useState(0)
  const [result, setResult] = useState<{ peeks: number; seconds: number } | null>(null)
  const runs = useLiveQuery(() => db.runs.where('textId').equals(text.id).toArray().catch(() => []), [text.id], [])
  const best = [...runs].sort((a, b) => a.peeks - b.peeks || a.seconds - b.seconds)[0]

  const begin = () => {
    setI(0)
    setPeeks(0)
    setPeeking(false)
    setResult(null)
    setStart(Date.now())
  }
  const next = async () => {
    setPeeking(false)
    if (i + 1 < text.phrases.length) return setI(i + 1)
    const run = { textId: text.id, peeks, seconds: Math.round((Date.now() - start) / 1000), at: Date.now() }
    setResult(run)
    setI(-1)
    await db.runs.add(run).catch(() => {})
  }

  return (
    <div className="space-y-3">
      <p className="text-muted">{t('memorize.memoryIntro')}</p>
      {best && <p className="text-sm">🏆 {t('memorize.bestRun', { peeks: best.peeks, seconds: best.seconds })}</p>}
      {result && <p role="status" className="card p-3">{t('memorize.runResult', result)}</p>}
      {i < 0 ? (
        <button type="button" className="btn btn-primary" onClick={begin}>{t('memorize.start')}</button>
      ) : (
        <div className="card space-y-3 p-4">
          <p className="text-sm text-muted">{t('memorize.memoryProgress', { n: i + 1, total: text.phrases.length, peeks })}</p>
          <PhraseLine phrase={text.phrases[i]} n={i + 1} hidden={!peeking} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn"
              disabled={peeking}
              onClick={() => {
                setPeeking(true)
                setPeeks(peeks + 1)
              }}
            >
              👁 {t('memorize.peek')}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void next()}>{t('memorize.nextPhrase')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
