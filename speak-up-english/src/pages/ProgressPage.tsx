import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { useProgress, type AttemptKind } from '../hooks/useProgress'
import LineChart from '../components/LineChart'
import Stars from '../components/Stars'
import { WPM_MAX, WPM_MIN } from '../lib/scoring'

const KIND_LABEL: Record<AttemptKind, string> = {
  shadowing: 'Shadowing',
  pronunciation: 'Pronunciation',
  roleplay: 'Role-play',
  free: 'Free speaking',
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

export default function ProgressPage() {
  const { progress, streak } = useProgress()
  const attempts = progress.attempts
  // Pace and fillers only make sense for longer answers.
  const longAnswers = attempts.filter((a) => (a.kind === 'free' || a.kind === 'roleplay') && a.wpm !== undefined).slice(-20)
  const accuracyAttempts = attempts.filter((a) => a.accuracy !== undefined)

  const stats = [
    { label: 'Lessons completed', value: `${progress.completed.length}/${lessons.length}` },
    { label: 'Speaking attempts', value: String(attempts.length) },
    { label: 'Average stars', value: attempts.length ? avg(attempts.map((a) => a.stars)).toFixed(1) : '–' },
    { label: 'Shadowing accuracy', value: accuracyAttempts.length ? `${Math.round(avg(accuracyAttempts.map((a) => a.accuracy!)))}%` : '–' },
    { label: 'Day streak', value: String(streak) },
  ]

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Your progress</p>
        <h1 className="h-serif mt-2 text-4xl md:text-5xl">How you're improving</h1>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5" aria-label="Summary">
        {stats.map((s) => (
          <div key={s.label} className="card !p-4">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="h-serif mt-1 text-3xl tabular-nums">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">Speaking pace (words per minute)</h2>
          <p className="text-xs text-muted">Role-play and free speaking. The green band is the target, {WPM_MIN}–{WPM_MAX}.</p>
          <div className="mt-3">
            <LineChart data={longAnswers.map((a) => a.wpm!)} label="Words per minute trend" band={[WPM_MIN, WPM_MAX]} />
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold">Filler words per answer</h2>
          <p className="text-xs text-muted">Lower is better. Replace fillers with a short pause.</p>
          <div className="mt-3">
            <LineChart data={longAnswers.map((a) => a.fillers ?? 0)} label="Filler words trend" />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold">Lessons</h2>
        <ul className="mt-3 divide-y divide-line">
          {lessons
            .filter((l) => l.status === 'available')
            .map((l) => {
              const la = attempts.filter((a) => a.lessonId === l.id)
              const quiz = progress.quizScores[l.id]
              return (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <Link to={`/lesson/${l.id}`} className="hover:text-gold">
                    <span className="text-muted">Lesson {l.id}</span> · {l.title}
                  </Link>
                  <span className="flex items-center gap-4 text-sm text-muted">
                    <span>{la.length} attempts</span>
                    <span>Quiz: {quiz !== undefined ? `${quiz}/5` : '–'}</span>
                    {progress.completed.includes(l.id) ? <span className="text-good">Completed</span> : <span>In progress</span>}
                  </span>
                </li>
              )
            })}
        </ul>
      </section>

      <section className="card">
        <h2 className="font-semibold">Recent activity</h2>
        {attempts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing yet. Open a lesson and record your first answer!</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {attempts
              .slice(-8)
              .reverse()
              .map((a) => (
                <li key={a.at} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <span>
                    <span className="text-muted">{a.date}</span> · Lesson {a.lessonId} · {KIND_LABEL[a.kind]}
                  </span>
                  <span className="flex items-center gap-3 text-muted">
                    {a.accuracy !== undefined && <span>{a.accuracy}%</span>}
                    {a.kind !== 'shadowing' && a.kind !== 'pronunciation' && a.wpm !== undefined && <span>{a.wpm} wpm</span>}
                    <Stars value={a.stars} />
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  )
}
