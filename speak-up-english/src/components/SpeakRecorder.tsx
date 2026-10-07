import { useEffect, useRef, useState } from 'react'
import { FRAME_SEC, useRecorder } from '../hooks/useRecorder'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useProgress, type AttemptKind } from '../hooks/useProgress'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import {
  buildFeedback,
  countFillers,
  detectPauses,
  diffWords,
  wordsPerMinute,
  type DiffResult,
  type SpeakingFeedback,
  type SpeakingMetrics,
} from '../lib/scoring'
import FeedbackPanel from './FeedbackPanel'
import { MicIcon, StopIcon } from './Icons'
import Stars from './Stars'

interface Props {
  lessonId: number
  kind: AttemptKind
  /** When set, the transcript is compared word-by-word to this sentence. */
  target?: string
  maxSeconds?: number
  minSeconds?: number
  label?: string
  onDone?: (feedback: SpeakingFeedback) => void
}

interface Result {
  metrics: SpeakingMetrics
  feedback: SpeakingFeedback
  diff?: DiffResult
  audioUrl: string
}

export default function SpeakRecorder({ lessonId, kind, target, maxSeconds, minSeconds, label = 'Record', onDone }: Props) {
  const recorder = useRecorder()
  const recognition = useSpeechRecognition()
  const tts = useSpeechSynthesis()
  const { recordAttempt } = useProgress()
  const [result, setResult] = useState<Result | null>(null)
  const [selfStars, setSelfStars] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const stopping = useRef(false)

  const useRecognition = recognition.supported

  async function handleStart() {
    tts.stop()
    setResult(null)
    setSelfStars(null)
    stopping.current = false
    const ok = await recorder.start()
    if (ok && useRecognition) recognition.start()
  }

  async function handleStop() {
    if (stopping.current) return
    stopping.current = true
    setBusy(true)
    const [rec, transcript] = await Promise.all([recorder.stop(), useRecognition ? recognition.stop() : Promise.resolve('')])
    setBusy(false)
    if (!rec) return
    const metrics: SpeakingMetrics = {
      transcript,
      durationSec: rec.durationSec,
      wpm: wordsPerMinute(transcript, rec.durationSec),
      fillers: countFillers(transcript),
      pauses: detectPauses(rec.levels, FRAME_SEC),
    }
    let diff: DiffResult | undefined
    if (target && useRecognition) {
      diff = diffWords(target, transcript)
      metrics.accuracy = diff.accuracy
    }
    const feedback = buildFeedback(metrics)
    setResult({ metrics, feedback, diff, audioUrl: rec.url })
    if (useRecognition) {
      recordAttempt({ lessonId, kind, stars: feedback.stars, wpm: metrics.wpm, fillers: metrics.fillers.total, accuracy: metrics.accuracy })
      onDone?.(feedback)
    }
  }

  // Auto-stop at the time limit.
  useEffect(() => {
    if (recorder.recording && maxSeconds && recorder.elapsed >= maxSeconds) void handleStop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.elapsed, recorder.recording, maxSeconds])

  // Release old audio blobs.
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.audioUrl) }, [result])

  function handleSelfAssess(stars: number) {
    if (!result) return
    setSelfStars(stars)
    recordAttempt({ lessonId, kind, stars })
    onDone?.({ stars, tips: [] })
  }

  const error = recorder.error ?? recognition.error
  const secs = Math.floor(recorder.elapsed)
  const tooShort = minSeconds && recorder.recording && recorder.elapsed < minSeconds

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {!recorder.recording ? (
          <button type="button" className="btn-gold" onClick={handleStart} disabled={busy || !recorder.supported} aria-label={`${label}: start recording`}>
            <MicIcon width={16} height={16} />
            {result ? 'Try again' : label}
          </button>
        ) : (
          <button type="button" className="btn bg-bad text-white" onClick={handleStop} aria-label="Stop recording">
            <StopIcon width={16} height={16} />
            Stop
          </button>
        )}

        {recorder.recording && (
          <div className="flex items-center gap-3 text-sm text-muted" aria-live="polite">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-bad opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-bad" />
            </span>
            <span className="tabular-nums">
              {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
              {maxSeconds ? ` / ${Math.floor(maxSeconds / 60)}:${String(maxSeconds % 60).padStart(2, '0')}` : ''}
            </span>
            <span className="h-2 w-24 overflow-hidden rounded-full bg-surface-2" aria-hidden>
              <span className="block h-full bg-gold transition-[width]" style={{ width: `${Math.min(100, recorder.level * 600)}%` }} />
            </span>
            {tooShort ? <span className="text-xs">Keep going: aim for at least {minSeconds}s</span> : null}
          </div>
        )}
        {busy && <span className="text-sm text-muted">Analysing…</span>}
      </div>

      {recorder.recording && useRecognition && (
        <p className="min-h-6 text-sm text-muted italic" aria-live="polite">
          {recognition.transcript} <span className="opacity-60">{recognition.interim}</span>
          {!recognition.transcript && !recognition.interim && 'Listening…'}
        </p>
      )}

      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      {!recorder.supported && <p className="text-sm text-warn">Recording is not available in this browser. Try Chrome or Edge.</p>}

      {result && useRecognition && (
        <FeedbackPanel metrics={result.metrics} feedback={result.feedback} diff={result.diff} audioUrl={result.audioUrl} showPace={!target} />
      )}

      {result && !useRecognition && (
        <div className="space-y-3 rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-sm text-muted">
            Your browser can't turn speech into text, so you can review your own recording instead. Listen and compare it with the model.
          </p>
          <audio controls src={result.audioUrl} className="w-full" />
          <p className="text-sm">
            Length: {result.metrics.durationSec.toFixed(1)}s · Long pauses: {result.metrics.pauses.length}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">How did it go?</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className={`btn-ghost !px-3 ${selfStars === n ? '!border-gold text-gold' : ''}`} onClick={() => handleSelfAssess(n)} aria-label={`Rate yourself ${n} stars`}>
                {n}★
              </button>
            ))}
            {selfStars !== null && <Stars value={selfStars} />}
          </div>
        </div>
      )}
    </div>
  )
}
