import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addTally } from '../lib/db'
import { bell, keepAwake, vibrate } from '../lib/device'
import { startMala, tap, total, undo, type MalaState } from '../lib/mala'

/** Big tap target counter. Every tap is saved to the accumulation tally for the text. */
export function MalaCounter({ textId, target, onRound }: { textId: string; target: number; onRound?: (rounds: number) => void }) {
  const { t } = useTranslation()
  const [s, setState] = useState<MalaState>(() => startMala(target))
  const ref = useRef(s)
  const setS = (next: MalaState) => {
    ref.current = next
    setState(next)
  }
  useEffect(() => {
    const fresh = startMala(target)
    ref.current = fresh
    setState(fresh)
  }, [target, textId])
  useEffect(() => {
    void keepAwake(true)
    return () => void keepAwake(false)
  }, [])

  const count = useCallback(() => {
    const { state, roundDone } = tap(ref.current)
    ref.current = state
    setState(state)
    if (roundDone) {
      bell()
      vibrate([80, 60, 80])
      onRound?.(state.rounds)
    } else vibrate(15)
    void addTally(textId, 1).catch(() => {})
  }, [textId, onRound])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === 'AudioVolumeUp' || e.key === 'AudioVolumeDown') {
        if ((e.target as HTMLElement)?.closest('button, input, select, textarea, a')) return
        e.preventDefault()
        count()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count])

  const pct = (s.count / s.target) * 100
  return (
    <div className="space-y-3">
      <button
        type="button"
        data-testid="mala-tap"
        onClick={count}
        className="card relative mx-auto flex aspect-square w-full max-w-[17rem] flex-col items-center justify-center overflow-hidden select-none"
        aria-label={t('mala.tap')}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-4" aria-hidden>
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--line)" strokeWidth="4" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--saffron)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 282.7} 282.7`} transform="rotate(-90 50 50)" />
        </svg>
        <span className="text-6xl font-semibold tabular-nums" aria-live="polite" data-testid="mala-count">{s.count}</span>
        <span className="text-muted">/ {s.target}</span>
        <span className="mt-1 text-sm">{t('mala.rounds', { count: s.rounds })}</span>
      </button>
      <div className="flex items-center justify-between text-sm">
        <span>{t('mala.thisSession', { count: total(s) })}</span>
        <button type="button" className="btn min-h-9 px-3" onClick={() => {
          if (total(s) === 0) return
          setS(undo(s))
          void addTally(textId, -1).catch(() => {})
        }}>↶ {t('mala.undo')}</button>
      </div>
      <p className="text-xs text-muted">{t('mala.keysHint')}</p>
    </div>
  )
}
