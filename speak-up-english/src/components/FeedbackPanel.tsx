import { WPM_MAX, WPM_MIN, type DiffResult, type SpeakingFeedback, type SpeakingMetrics } from '../lib/scoring'
import DiffView from './DiffView'
import Stars from './Stars'

interface Props {
  metrics: SpeakingMetrics
  feedback: SpeakingFeedback
  diff?: DiffResult
  audioUrl: string
  /** Pace is meaningless for a single short sentence, so drills can hide it. */
  showPace?: boolean
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' }) {
  const color = tone === 'good' ? 'text-good' : tone === 'warn' ? 'text-warn' : tone === 'bad' ? 'text-bad' : 'text-ink'
  return (
    <div className="rounded-xl bg-surface p-3">
      <div className="text-[11px] tracking-wide text-muted uppercase">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  )
}

export default function FeedbackPanel({ metrics, feedback, diff, audioUrl, showPace = true }: Props) {
  const paceTone = metrics.wpm >= WPM_MIN && metrics.wpm <= WPM_MAX ? 'good' : 'warn'
  const fillerEntries = Object.entries(metrics.fillers.counts)
  return (
    <section className="space-y-4 rounded-xl border border-line bg-surface-2 p-4" aria-label="Speaking feedback" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">Your feedback</h4>
        <Stars value={feedback.stars} />
      </div>

      {diff ? (
        <div>
          <div className="mb-1 text-xs text-muted">Compared with the model sentence</div>
          <DiffView ops={diff.ops} />
        </div>
      ) : (
        <div>
          <div className="mb-1 text-xs text-muted">What we heard</div>
          <p className="leading-relaxed">{metrics.transcript || <em className="text-muted">No words detected</em>}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {diff && <Metric label="Accuracy" value={`${diff.accuracy}%`} tone={diff.accuracy >= 85 ? 'good' : diff.accuracy >= 60 ? 'warn' : 'bad'} />}
        {showPace && <Metric label="Pace (wpm)" value={String(metrics.wpm)} tone={paceTone} />}
        <Metric label="Filler words" value={String(metrics.fillers.total)} tone={metrics.fillers.total === 0 ? 'good' : metrics.fillers.total < 3 ? 'warn' : 'bad'} />
        <Metric label="Long pauses" value={String(metrics.pauses.length)} tone={metrics.pauses.length <= 1 ? 'good' : 'warn'} />
        <Metric label="Length" value={`${metrics.durationSec.toFixed(0)}s`} />
      </div>

      {showPace && (
        <p className="text-xs text-muted">
          Target pace: {WPM_MIN}–{WPM_MAX} words per minute.
          {fillerEntries.length > 0 && ` Fillers: ${fillerEntries.map(([w, n]) => `"${w}" ×${n}`).join(', ')}.`}
        </p>
      )}

      <ul className="space-y-1.5">
        {feedback.tips.map((t) => (
          <li key={t} className="flex gap-2 text-sm">
            <span className="text-gold" aria-hidden>→</span>
            {t}
          </li>
        ))}
      </ul>

      <div>
        <div className="mb-1 text-xs text-muted">Play back your recording</div>
        <audio controls src={audioUrl} className="w-full" />
      </div>
    </section>
  )
}
