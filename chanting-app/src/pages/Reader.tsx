import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlaceholderVoiceBadge } from '../components/Badges'
import { PhraseCard } from '../components/PhraseCard'
import { PlayerBar } from '../components/PlayerBar'
import { SyllableSheet } from '../components/SyllableSheet'
import { patchProgress } from '../lib/db'
import { useSettings } from '../lib/settings'
import { showZhPhon, type Settings } from '../lib/settingsStore'
import { useLang } from '../lib/useLang'
import { useTextCtx } from './TextLayout'

type ShowKey = keyof Settings['show']
const TOGGLES: ShowKey[] = ['tib', 'phon', 'iast', 'zhPhon', 'meaning']

export default function Reader() {
  const { text, engine, state } = useTextCtx()
  const { t } = useTranslation()
  const { L } = useLang()
  const { settings, update } = useSettings()
  const [open, setOpen] = useState<{ p: number; s: number } | null>(null)
  const refs = useRef<(HTMLElement | null)[]>([])

  const active = state && state.syllable >= 0 ? engine!.timeline.syllables[state.syllable] : null
  const activePhrase = state?.phrase ?? -1
  const playing = !!state?.playing

  // Karaoke: keep the sounding phrase in view
  useEffect(() => {
    if (!playing || activePhrase < 0) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    refs.current[activePhrase]?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [activePhrase, playing])

  const flatIndex = (p: number, s: number) => text.phrases.slice(0, p).reduce((n, ph) => n + ph.syllables.length, 0) + s
  const isOn = (k: ShowKey) => (k === 'zhPhon' ? showZhPhon(settings) : settings.show[k])

  return (
    <div className="space-y-3">
      <div role="group" aria-label={t('reader.show')} className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm text-muted">{t('reader.show')}:</span>
        {TOGGLES.map((k) => (
          <button
            key={k}
            type="button"
            className="btn min-h-8 px-2.5 text-sm"
            aria-pressed={isOn(k)}
            onClick={() => update({ show: { ...settings.show, [k]: !isOn(k) } })}
          >
            {t(`lines.${k}`)}
          </button>
        ))}
        {engine?.synthetic && <PlaceholderVoiceBadge />}
      </div>

      {text.phrases.map((ph, p) => (
        <PhraseCard
          key={ph.id}
          ref={(el) => {
            refs.current[p] = el
          }}
          phrase={ph}
          index={p}
          active={!!state && (state.playing || state.yourTurn) && activePhrase === p}
          activeSyllable={active && active.p === p && (state?.playing || state?.yourTurn) ? active.s : -1}
          onSyllable={(s) => setOpen({ p, s })}
          onPlay={engine ? () => engine.playPhrase(p) : undefined}
        />
      ))}

      <details className="card p-4">
        <summary className="cursor-pointer font-semibold">🪷 {t('reader.context')}</summary>
        <p className="mt-2 whitespace-pre-line leading-relaxed">{L(text.practiceNotes)}</p>
        <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">{t('reader.transmission')}</p>
      </details>

      {engine && state && <PlayerBar engine={engine} state={state} onPlay={() => void patchProgress(text.id, { listened: true }).catch(() => {})} />}

      <SyllableSheet
        syl={open ? text.phrases[open.p].syllables[open.s] : null}
        onClose={() => setOpen(null)}
        onPlay={() => open && engine?.playSyllable(flatIndex(open.p, open.s))}
        onPlayFrom={() => {
          if (!open || !engine) return
          engine.playFromSyllable(flatIndex(open.p, open.s))
          setOpen(null)
        }}
      />
    </div>
  )
}
