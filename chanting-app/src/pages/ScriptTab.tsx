import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StackBreakdown } from '../components/SyllableSheet'
import { Tib } from '../components/Tib'
import type { Syllable } from '../lib/content'
import { getProgress, patchProgress } from '../lib/db'
import { useSettings } from '../lib/settings'
import { shuffle } from '../lib/shuffle'
import { hasStackOrSign } from '../lib/tibetan'
import { useTextCtx } from './TextLayout'

export default function ScriptTab() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'stacks' | 'drill'>('stacks')
  return (
    <div className="space-y-4">
      <div role="group" className="flex gap-2">
        <button type="button" className="btn" aria-pressed={mode === 'stacks'} onClick={() => setMode('stacks')}>{t('script.stacks')}</button>
        <button type="button" className="btn" aria-pressed={mode === 'drill'} onClick={() => setMode('drill')}>{t('script.drill')}</button>
      </div>
      {mode === 'stacks' ? <StackDecoder /> : <Drill />}
    </div>
  )
}

function useUniqueSyllables() {
  const { text } = useTextCtx()
  return useMemo(() => {
    const seen = new Map<string, { syl: Syllable; flat: number }>()
    let flat = 0
    for (const p of text.phrases)
      for (const s of p.syllables) {
        if (!seen.has(s.tib)) seen.set(s.tib, { syl: s, flat })
        flat++
      }
    return [...seen.values()]
  }, [text])
}

function StackDecoder() {
  const { t } = useTranslation()
  const { engine } = useTextCtx()
  const { settings } = useSettings()
  const list = useUniqueSyllables().filter((x) => hasStackOrSign(x.syl.tib))
  return (
    <div className="space-y-3">
      <p className="text-muted">{t('script.stacksIntro', { count: list.length })}</p>
      {list.map(({ syl, flat }) => (
        <article key={syl.tib} className="card p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <Tib className="text-4xl!">{syl.tib}</Tib>
              <span className="text-lg font-medium">{syl.phon[settings.tradition]}</span>
              <span className="italic text-muted">{syl.iast}</span>
            </div>
            <button type="button" className="btn px-3" aria-label={t('syllable.play')} onClick={() => engine?.playSyllable(flat)}>▶</button>
          </div>
          <StackBreakdown syl={syl} />
        </article>
      ))}
    </div>
  )
}

const ROUND = 10

function Drill() {
  const { t } = useTranslation()
  const { text, engine } = useTextCtx()
  const { settings } = useSettings()
  const pool = useUniqueSyllables()
  const [level, setLevel] = useState<1 | 2 | 3>(1)
  const [round, setRound] = useState(() => makeRound(pool))
  const [qi, setQi] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  const done = qi >= round.length
  const phon = (s: Syllable) => s.phon[settings.tradition]

  const q = round[qi]
  const options = useMemo(() => {
    if (!q) return []
    const others = shuffle([...new Set(pool.map((x) => phon(x.syl)).filter((p) => p !== phon(q.syl)))]).slice(0, 3)
    return shuffle([phon(q.syl), ...others])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, settings.tradition])

  const choose = (o: string) => {
    if (answer) return
    setAnswer(o)
    const right = o === phon(q.syl)
    if (right) setScore((s) => s + 1)
    engine?.playSyllable(q.flat)
  }
  const next = async () => {
    setAnswer(null)
    const n = qi + 1
    setQi(n)
    if (n >= round.length) {
      try {
        const p = await getProgress(text.id)
        const b = Math.max(p.drillBest, score)
        await patchProgress(text.id, { drillBest: b })
        setBest(b)
      } catch {
        setBest(score)
      }
    }
  }
  const restart = () => {
    setRound(makeRound(pool))
    setQi(0)
    setScore(0)
    setAnswer(null)
    setBest(null)
  }

  return (
    <div className="space-y-3">
      <div role="group" aria-label={t('drill.level')} className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">{t('drill.level')}:</span>
        {([1, 2, 3] as const).map((l) => (
          <button key={l} type="button" className="btn min-h-9" aria-pressed={level === l} onClick={() => setLevel(l)}>
            {t(`drill.level${l}`)}
          </button>
        ))}
      </div>
      {done ? (
        <div className="card p-6 text-center">
          <p className="text-2xl font-semibold">{t('drill.result', { score, total: round.length })}</p>
          {best !== null && <p className="text-muted">{t('drill.best', { best })}</p>}
          <button type="button" className="btn btn-primary mt-4" onClick={restart}>{t('drill.again')}</button>
        </div>
      ) : (
        <div className="card p-5">
          <p className="mb-1 text-sm text-muted">{t('drill.progress', { n: qi + 1, total: round.length })} · {t('drill.score', { score })}</p>
          <p className="mb-3">{t('drill.prompt')}</p>
          <div className="mb-4 text-center">
            <Tib className="text-6xl! leading-normal">{q.syl.tib}</Tib>
            {level <= 2 && <p className="text-muted">Wylie: {q.syl.wylie}</p>}
            {level === 1 && <p className="italic text-muted">IAST: {q.syl.iast}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {options.map((o) => {
              const right = o === phon(q.syl)
              const state = answer ? (right ? 'border-ok bg-ok/15' : o === answer ? 'border-warn bg-warn/15' : '') : ''
              return (
                <button key={o} type="button" className={`btn min-h-12 text-lg ${state}`} onClick={() => choose(o)} disabled={!!answer && !right && o !== answer}>
                  {o}
                </button>
              )
            })}
          </div>
          {answer && (
            <div className="mt-3 flex items-center justify-between" role="status">
              <span>{answer === phon(q.syl) ? `✓ ${t('drill.right')}` : `✗ ${t('drill.wrong', { answer: phon(q.syl) })}`}</span>
              <button type="button" className="btn btn-primary" onClick={() => void next()} autoFocus>{t('common.next')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function makeRound<T>(pool: T[]): T[] {
  const out: T[] = []
  while (out.length < ROUND) out.push(...shuffle(pool))
  return out.slice(0, ROUND)
}
