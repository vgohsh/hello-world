import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AudioEngine, EngineState } from '../lib/audioEngine'

const RATES = [1, 0.75, 0.5]

/** Docked player: one compact row on phones, extra controls behind "More". */
export function PlayerBar({ engine, state, onPlay }: { engine: AudioEngine; state: EngineState; onPlay?: () => void }) {
  const { t } = useTranslation()
  const [more, setMore] = useState(false)
  const tl = engine.timeline
  const phraseLoop = !!state.loop && tl.phrases.some((p) => Math.abs(p.start - state.loop!.a) < 0.01 && Math.abs(p.end + 0.25 - state.loop!.b) < 0.01)
  const abLoop = !!state.loop && !phraseLoop
  const active = state.playing || state.yourTurn
  const icon = 'btn min-h-10 min-w-9 px-1.5'

  return (
    <div
      className="card sticky z-10 mt-4 space-y-2 p-2.5 shadow-lg"
      style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
      role="region"
      aria-label={t('player.label')}
    >
      {state.yourTurn && (
        <p role="status" className="rounded-lg bg-highlight px-3 py-1 text-center text-sm font-medium">🗣 {t('player.yourTurn')}</p>
      )}
      <input
        type="range"
        min={0}
        max={tl.duration}
        step={0.05}
        value={state.time}
        onChange={(e) => engine.seek(Number(e.target.value))}
        aria-label={t('player.position')}
        className="block h-2 w-full accent-[var(--accent)]"
      />
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-0.5">
          <button type="button" className={icon} onClick={() => engine.nextPhrase(-1)} aria-label={t('player.prev')}>⏮</button>
          <button
            type="button"
            className="btn btn-primary min-h-11 min-w-12 px-3 text-lg"
            onClick={() => {
              onPlay?.()
              engine.toggle()
            }}
            aria-label={active ? t('player.pause') : t('player.play')}
          >
            {active ? '⏸' : '▶'}
          </button>
          <button type="button" className={icon} onClick={() => engine.nextPhrase(1)} aria-label={t('player.next')}>⏭</button>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={`${icon} tabular-nums`}
            onClick={() => engine.setRate(RATES[(RATES.indexOf(state.rate) + 1) % RATES.length])}
            aria-label={`${t('player.speed')}: ${state.rate}×`}
          >
            {state.rate}×
          </button>
          <button type="button" className={icon} aria-pressed={phraseLoop} onClick={() => engine.loopPhrase(phraseLoop ? null : state.phrase)} aria-label={t('player.loopPhrase')} title={t('player.loopPhrase')}>
            🔁
          </button>
          <button type="button" className={icon} aria-pressed={state.callResponse} onClick={() => engine.setCallResponse(!state.callResponse)} aria-label={t('player.callResponse')} title={t('player.callResponse')}>
            🗣
          </button>
          <button type="button" className={icon} aria-expanded={more} onClick={() => setMore(!more)} aria-label={t('player.more')}>⋯</button>
        </div>
      </div>
      {more && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-2 text-sm">
          <span className="text-muted">{t('player.loopPhrase')}: {phraseLoop ? t('common.on') : t('common.off')} · {t('player.callResponse')}: {state.callResponse ? t('common.on') : t('common.off')}</span>
          <div className="flex w-full flex-wrap gap-1.5">
            <button
              type="button"
              className="btn min-h-9 px-3"
              aria-pressed={abLoop}
              onClick={() => engine.setLoop(abLoop ? null : { a: state.time, b: Math.min(tl.duration, state.time + 5) })}
            >
              A–B
            </button>
            {abLoop && (
              <button type="button" className="btn min-h-9 px-3" onClick={() => engine.setLoop({ a: state.loop!.a, b: Math.max(state.loop!.a + 0.3, state.time) })}>
                {t('player.setB')}
              </button>
            )}
          </div>
          <p className="w-full text-xs text-muted">{t('player.abHint')}</p>
        </div>
      )}
    </div>
  )
}
