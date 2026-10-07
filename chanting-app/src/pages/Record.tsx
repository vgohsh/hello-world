import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { PlaceholderVoiceBadge } from '../components/Badges'
import { Tib } from '../components/Tib'
import { Waveform } from '../components/Waveform'
import { db, type Recording } from '../lib/db'
import { useSettings } from '../lib/settings'
import { useLang } from '../lib/useLang'
import { useTextCtx } from './TextLayout'

export default function Record() {
  const { t } = useTranslation()
  const { L } = useLang()
  const { settings } = useSettings()
  const { text, engine } = useTextCtx()
  const [p, setP] = useState(0)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<MediaRecorder | null>(null)
  const started = useRef(0)
  const phrase = text.phrases[p]
  const mine = useLiveQuery(
    () => db.recordings.where('[textId+phraseId]').equals([text.id, phrase.id]).reverse().sortBy('at').catch(() => [] as Recording[]),
    [text.id, phrase.id],
    [] as Recording[],
  )
  const latest = mine[0]
  const ph = engine?.timeline.phrases[p]
  const refDur = ph ? ph.end - ph.start : 0
  const supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  useEffect(() => () => rec.current?.stream.getTracks().forEach((tr) => tr.stop()), [])

  const start = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const r = new MediaRecorder(stream)
      const chunks: Blob[] = []
      r.ondataavailable = (e) => chunks.push(e.data)
      r.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop())
        const blob = new Blob(chunks, { type: r.mimeType })
        const duration = (Date.now() - started.current) / 1000
        await db.recordings.add({ textId: text.id, phraseId: phrase.id, blob, duration, at: Date.now() }).catch(() => setError(t('record.saveFailed')))
      }
      rec.current = r
      started.current = Date.now()
      r.start()
      setRecording(true)
    } catch {
      setError(t('record.micDenied'))
    }
  }
  const stop = () => {
    rec.current?.stop()
    setRecording(false)
  }

  const url = useMemo(() => (latest ? URL.createObjectURL(latest.blob) : null), [latest])
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])

  const syls = phrase.syllables.length
  return (
    <div className="space-y-4">
      <p className="text-muted">{t('record.intro')}</p>
      <label className="block text-sm">
        <span className="text-muted">{t('record.phrase')}</span>
        <select className="btn mt-1 w-full justify-start" value={p} onChange={(e) => setP(Number(e.target.value))}>
          {text.phrases.map((ph, i) => (
            <option key={ph.id} value={i}>{i + 1}. {ph.phon[settings.tradition]}</option>
          ))}
        </select>
      </label>
      <div className="card space-y-3 p-4">
        <Tib>{phrase.tib}</Tib>
        <p className="font-medium">{phrase.phon[settings.tradition]}</p>
        <p className="text-sm text-muted">{L(phrase.gloss)}</p>

        <section className="rounded-lg bg-surface-2 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-semibold">{t('record.reference')}</h3>
            {engine?.synthetic && <PlaceholderVoiceBadge />}
          </div>
          {!engine?.synthetic && text.audio && ph && <Waveform source={text.audio.src} start={ph.start} end={ph.end} label={t('record.reference')} />}
          <button type="button" className="btn" onClick={() => engine?.playPhrase(p)}>▶ {t('record.playReference')}</button>
        </section>

        <section className="rounded-lg bg-surface-2 p-3">
          <h3 className="mb-2 font-semibold">{t('record.yours')}</h3>
          {!supported ? (
            <p className="text-warn">{t('record.unsupported')}</p>
          ) : (
            <button type="button" className={`btn ${recording ? 'border-warn text-warn' : 'btn-primary'}`} onClick={recording ? stop : () => void start()}>
              {recording ? `■ ${t('record.stop')}` : `● ${t('record.start')}`}
            </button>
          )}
          {error && <p role="alert" className="mt-2 text-warn">{error}</p>}
          {latest && url && (
            <div className="mt-3 space-y-2">
              <Waveform source={latest.blob} label={t('record.yours')} />
              <audio controls src={url} className="w-full" />
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted">{t('record.yourLength')}</dt><dd>{latest.duration.toFixed(1)} s</dd></div>
                <div><dt className="text-muted">{t('record.refLength')}</dt><dd>{refDur.toFixed(1)} s</dd></div>
                <div><dt className="text-muted">{t('record.yourPace')}</dt><dd>{(syls / latest.duration).toFixed(1)} {t('record.perSec')}</dd></div>
                <div><dt className="text-muted">{t('record.refPace')}</dt><dd>{refDur ? (syls / refDur).toFixed(1) : '–'} {t('record.perSec')}</dd></div>
              </dl>
              <p className="text-sm">{paceAdvice(latest.duration, refDur, t)}</p>
              <button type="button" className="btn text-sm" onClick={() => void db.recordings.where('[textId+phraseId]').equals([text.id, phrase.id]).delete()}>
                🗑 {t('record.delete')}
              </button>
            </div>
          )}
        </section>
        <p className="text-xs text-muted">🔒 {t('record.privacy')}</p>
      </div>
    </div>
  )
}

function paceAdvice(mine: number, ref: number, t: TFunction) {
  if (!ref) return ''
  const r = mine / ref
  if (r > 1.35) return t('record.slower')
  if (r < 0.75) return t('record.faster')
  return t('record.goodPace')
}
