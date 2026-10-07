import { useState } from 'react'
import { useProgress, type Accent } from '../hooks/useProgress'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { recognitionSupported } from '../hooks/useSpeechRecognition'
import { recorderSupported } from '../hooks/useRecorder'

export default function SettingsPage() {
  const { settings, updateSettings, resetProgress } = useProgress()
  const tts = useSpeechSynthesis()
  const [confirmReset, setConfirmReset] = useState(false)

  const support = [
    { label: 'Text to speech (listening)', ok: tts.supported },
    { label: 'Speech recognition (automatic feedback)', ok: recognitionSupported },
    { label: 'Audio recording (playback)', ok: recorderSupported },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="h-serif mt-2 text-4xl md:text-5xl">Make it yours</h1>
      </header>

      <section className="card space-y-5">
        <h2 className="font-semibold">Voice</h2>

        <fieldset>
          <legend className="text-sm text-muted">Accent</legend>
          <div className="mt-2 flex gap-2">
            {(['en-US', 'en-GB'] as Accent[]).map((a) => (
              <label key={a} className={`btn-ghost cursor-pointer ${settings.accent === a ? '!border-gold text-gold' : ''}`}>
                <input type="radio" name="accent" className="sr-only" checked={settings.accent === a} onChange={() => updateSettings({ accent: a, voiceURI: null })} />
                {a === 'en-US' ? '🇺🇸 American' : '🇬🇧 British'}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Used for listening and for speech recognition.</p>
        </fieldset>

        <div>
          <label htmlFor="voice" className="text-sm text-muted">Main voice</label>
          <select
            id="voice"
            className="mt-2 w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-ink"
            value={settings.voiceURI ?? ''}
            onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
          >
            <option value="">Automatic</option>
            {tts.voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          {tts.voices.length === 0 && <p className="mt-1 text-xs text-muted">No English voices found for this accent yet.</p>}
        </div>

        <div>
          <label htmlFor="rate" className="flex justify-between text-sm text-muted">
            <span>Speaking speed</span>
            <span className="tabular-nums">{settings.rate.toFixed(2)}×</span>
          </label>
          <input
            id="rate"
            type="range"
            min={0.6}
            max={1.3}
            step={0.05}
            value={settings.rate}
            onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
            className="mt-2 w-full accent-[var(--gold)]"
          />
        </div>

        <button type="button" className="btn-gold" onClick={() => tts.speak('Hello! This is how I sound. Nice to meet you.', 'voice-test')}>
          Test voice
        </button>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-2">
          {(['dark', 'light'] as const).map((t) => (
            <button key={t} type="button" className={`btn-ghost ${settings.theme === t ? '!border-gold text-gold' : ''}`} aria-pressed={settings.theme === t} onClick={() => updateSettings({ theme: t })}>
              {t === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Browser support</h2>
        <ul className="space-y-1.5 text-sm">
          {support.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className={s.ok ? 'text-good' : 'text-bad'} aria-hidden>{s.ok ? '✓' : '✗'}</span>
              {s.label}
              <span className="sr-only">{s.ok ? 'supported' : 'not supported'}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Chrome and Edge give the best results for speech recognition.</p>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Reset</h2>
        <p className="text-sm text-muted">This deletes your completed lessons, scores and streak on this device.</p>
        {confirmReset ? (
          <div className="flex gap-2">
            <button type="button" className="btn bg-bad text-white" onClick={() => { resetProgress(); setConfirmReset(false) }}>Yes, reset everything</button>
            <button type="button" className="btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn-ghost" onClick={() => setConfirmReset(true)}>Reset progress</button>
        )}
      </section>
    </div>
  )
}
