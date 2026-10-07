import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { PageTitle } from '../components/PageTitle'
import { Tib } from '../components/Tib'
import { TEXTS } from '../lib/content'
import { download } from '../lib/csv'
import { db, type SyllableTiming } from '../lib/db'
import { useLang } from '../lib/useLang'

type Regions = ReturnType<typeof RegionsPlugin.create>

/**
 * Tap-along alignment: play a recording and press Space (or "Mark") at the start of each
 * syllable. Regions can then be dragged to fine-tune, and exported as JSON.
 */
export default function Align() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [textId, setTextId] = useState(TEXTS[TEXTS.length - 1].id)
  const text = TEXTS.find((x) => x.id === textId)!
  const flat = useMemo(() => text.phrases.flatMap((p, pi) => p.syllables.map((s, si) => ({ p: pi, s: si, tib: s.tib, phon: s.phon.tibetan }))), [text])
  const container = useRef<HTMLDivElement>(null)
  const ws = useRef<WaveSurfer | null>(null)
  const regions = useRef<Regions | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [marks, setMarks] = useState<number[]>([]) // syllable start times
  const [times, setTimes] = useState<SyllableTiming[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!file || !container.current) return
    const styles = getComputedStyle(document.documentElement)
    const w = WaveSurfer.create({
      container: container.current,
      height: 96,
      waveColor: styles.getPropertyValue('--muted'),
      progressColor: styles.getPropertyValue('--accent'),
      cursorColor: styles.getPropertyValue('--saffron'),
      minPxPerSec: 80,
    })
    const r = w.registerPlugin(RegionsPlugin.create())
    ws.current = w
    regions.current = r
    w.on('ready', () => setReady(true))
    w.on('play', () => setPlaying(true))
    w.on('pause', () => setPlaying(false))
    r.on('region-updated', () => setTimes(readRegions(r)))
    void w.loadBlob(file)
    setReady(false)
    setMarks([])
    setTimes([])
    return () => w.destroy()
  }, [file])

  const mark = () => {
    const w = ws.current
    if (!w || marks.length > flat.length) return
    setMarks((m) => [...m, w.getCurrentTime()])
  }

  // Space marks while the audio plays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || (e.target as HTMLElement).closest('input, select, textarea, button')) return
      e.preventDefault()
      if (playing) mark()
      else void ws.current?.play()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // After every syllable is marked (plus one final "end" mark), build draggable regions
  useEffect(() => {
    const r = regions.current
    if (!r || marks.length !== flat.length + 1) return
    r.clearRegions()
    flat.forEach((f, i) => {
      r.addRegion({ id: String(i), start: marks[i], end: Math.max(marks[i] + 0.05, marks[i + 1] - 0.01), content: f.phon, drag: true, resize: true, color: i % 2 ? 'rgba(201,138,27,0.18)' : 'rgba(122,31,31,0.15)' })
    })
    setTimes(readRegions(r))
    ws.current?.pause()
  }, [marks, flat])

  const result = () => text.phrases.map((p, pi) => ({
    id: p.id,
    syllables: p.syllables.map((s, si) => {
      const i = flat.findIndex((f) => f.p === pi && f.s === si)
      return { tib: s.tib, start: round(times[i].start), end: round(times[i].end) }
    }),
  }))
  const complete = times.length === flat.length

  const exportJson = () =>
    download(`${text.id}-alignment.json`, JSON.stringify({ textId: text.id, audio: file?.name, phrases: result() }, null, 2), 'application/json')

  const saveForApp = async () => {
    if (!file) return
    await db.customAudio.put({ textId: text.id, name: file.name, blob: file, phrases: result().map((p) => ({ syllables: p.syllables.map(({ start, end }) => ({ start, end })) })) })
    setSaved(true)
  }

  const next = marks.length < flat.length ? flat[marks.length] : null
  return (
    <div className="space-y-4">
      <PageTitle back="/settings" sub={t('align.intro')}>{t('align.title')}</PageTitle>
      <div className="card space-y-3 p-4">
        <label className="block text-sm">
          <span className="text-muted">{t('align.text')}</span>
          <select className="btn mt-1 w-full justify-start" value={textId} onChange={(e) => { setTextId(e.target.value); setMarks([]); setTimes([]) }}>
            {TEXTS.map((x) => <option key={x.id} value={x.id}>{x.title[lang]}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">{t('align.file')}</span>
          <input type="file" accept="audio/*" className="mt-1 block w-full" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <div ref={container} className="card min-h-24 overflow-hidden p-2" aria-label={t('align.waveform')} />

      {file && (
        <div className="card space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" disabled={!ready} onClick={() => void ws.current?.playPause()}>{playing ? '⏸' : '▶'} {t('align.play')}</button>
            <button type="button" className="btn btn-primary" disabled={!ready || !playing || marks.length > flat.length} onClick={mark}>⏺ {t('align.mark')}</button>
            <button type="button" className="btn" disabled={!marks.length} onClick={() => setMarks((m) => m.slice(0, -1))}>↶ {t('mala.undo')}</button>
            <button type="button" className="btn" onClick={() => { ws.current?.setTime(0); setMarks([]); setTimes([]); regions.current?.clearRegions() }}>↺ {t('align.restart')}</button>
          </div>
          <p role="status">
            {next ? (
              <>{t('align.next', { n: marks.length + 1, total: flat.length })} <Tib className="text-2xl!">{next.tib}</Tib> <strong>{next.phon}</strong></>
            ) : marks.length === flat.length ? t('align.markEnd') : t('align.done')}
          </p>
          <p className="text-sm text-muted">{t('align.keys')}</p>
        </div>
      )}

      {complete && (
        <div className="card space-y-3 p-4">
          <p>{t('align.fineTune')}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={exportJson}>⬇ {t('align.export')}</button>
            <button type="button" className="btn" onClick={() => void saveForApp()}>✓ {t('align.useHere')}</button>
          </div>
          {saved && <p role="status" className="text-ok">{t('align.saved')}</p>}
          <details>
            <summary className="cursor-pointer text-sm">{t('align.table')}</summary>
            <ol className="mt-2 grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
              {flat.map((f, i) => <li key={i}><Tib className="text-base!">{f.tib}</Tib> {times[i].start.toFixed(2)}–{times[i].end.toFixed(2)}</li>)}
            </ol>
          </details>
        </div>
      )}
    </div>
  )
}

function readRegions(r: Regions): SyllableTiming[] {
  return r.getRegions().slice().sort((a, b) => Number(a.id) - Number(b.id)).map((x) => ({ start: x.start, end: x.end }))
}

const round = (n: number) => Math.round(n * 1000) / 1000
