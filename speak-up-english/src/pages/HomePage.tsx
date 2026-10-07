import { Link } from 'react-router-dom'
import { availableLessons, lessons, modules } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import ProgressRing from '../components/ProgressRing'
import { FlameIcon } from '../components/Icons'
import { recognitionSupported } from '../hooks/useSpeechRecognition'

export default function HomePage() {
  const { progress, streak, isUnlocked } = useProgress()
  const done = progress.completed.length
  const pct = (done / lessons.length) * 100

  const next =
    (progress.lastLessonId && !progress.completed.includes(progress.lastLessonId) && lessons.find((l) => l.id === progress.lastLessonId)) ||
    availableLessons.find((l) => !progress.completed.includes(l.id) && isUnlocked(l.id)) ||
    null

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-10 md:px-10 md:py-14">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gold-soft blur-3xl" aria-hidden />
        <p className="eyebrow">English speaking course</p>
        <h1 className="h-serif mt-3 text-5xl leading-[1.05] md:text-6xl">Speak Up English</h1>
        <p className="mt-4 max-w-xl text-muted md:text-lg">
          Practise confident, natural spoken English for work and life: listen to models, shadow them, role-play real situations and get instant feedback on your speaking.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {next ? (
            <Link to={`/lesson/${next.id}`} className="btn-gold !px-6 !py-3 !text-base">
              {progress.lastLessonId ? 'Continue' : 'Start'}: Lesson {next.id}
            </Link>
          ) : (
            <Link to="/course" className="btn-gold !px-6 !py-3 !text-base">Review the course</Link>
          )}
          <Link to="/course" className="btn-ghost !px-6 !py-3 !text-base">View all lessons</Link>
        </div>
      </section>

      {!recognitionSupported && (
        <div role="note" className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm">
          <strong>Heads up:</strong> your browser can't convert speech to text, so practice runs in "record and self-assess" mode. For automatic feedback, use Chrome or Edge.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card flex items-center gap-5 md:col-span-2">
          <ProgressRing value={pct} label="complete" />
          <div>
            <h2 className="h-serif text-2xl">Your progress</h2>
            <p className="mt-1 text-muted">
              {done} of {lessons.length} lessons completed
            </p>
            {next && (
              <p className="mt-3 text-sm">
                Up next: <Link to={`/lesson/${next.id}`} className="text-gold underline-offset-4 hover:underline">{next.title}</Link>{' '}
                <span className="text-muted">· {next.durationMin} min</span>
              </p>
            )}
          </div>
        </div>
        <div className="card flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gold">
            <FlameIcon />
            <span className="eyebrow">Daily streak</span>
          </div>
          <p className="h-serif mt-2 text-5xl">
            {streak} <span className="text-xl text-muted">day{streak === 1 ? '' : 's'}</span>
          </p>
          <p className="mt-1 text-sm text-muted">{streak ? 'Keep it going. Practise today!' : 'Do one speaking task today to start a streak.'}</p>
        </div>
      </section>

      <section>
        <h2 className="h-serif mb-4 text-3xl">Course modules</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((m) => {
            const ls = lessons.filter((l) => l.moduleId === m.id)
            const available = ls.some((l) => l.status === 'available')
            const completed = ls.filter((l) => progress.completed.includes(l.id)).length
            return (
              <Link key={m.id} to={`/course#module-${m.id}`} className="card group block transition-colors hover:border-gold">
                <div className="flex items-start justify-between gap-2">
                  <p className="eyebrow">Module {m.id}</p>
                  {!available && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">Coming soon</span>}
                </div>
                <h3 className="h-serif mt-2 text-2xl group-hover:text-gold">{m.title}</h3>
                <p className="mt-1 text-sm text-muted">{m.description}</p>
                <p className="mt-3 text-xs text-muted">
                  {completed}/{ls.length} lessons · {ls.reduce((s, l) => s + l.durationMin, 0)} min
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
