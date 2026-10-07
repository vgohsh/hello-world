import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { lessons, modules } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import { CheckIcon, LockIcon } from '../components/Icons'

export default function CoursePage() {
  const { progress, settings, updateSettings, isUnlocked } = useProgress()
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">The course</p>
          <h1 className="h-serif mt-2 text-4xl md:text-5xl">15 lessons to speak up</h1>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-muted">
          <span>Unlock all lessons</span>
          <input
            type="checkbox"
            className="peer sr-only"
            checked={settings.unlockAll}
            onChange={(e) => updateSettings({ unlockAll: e.target.checked })}
          />
          <span className="relative h-6 w-11 rounded-full bg-surface-2 ring-1 ring-line transition-colors peer-checked:bg-gold peer-focus-visible:outline-2 peer-focus-visible:outline-gold after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-ink after:transition-transform peer-checked:after:translate-x-5" aria-hidden />
        </label>
      </header>

      {modules.map((m) => (
        <section key={m.id} id={`module-${m.id}`} className="scroll-mt-24 rounded-3xl border border-line bg-surface p-4 md:p-6">
          <p className="eyebrow">Module {m.id}</p>
          <h2 className="h-serif mt-1 text-3xl">{m.title}</h2>
          <p className="mt-1 text-sm text-muted">{m.description}</p>
          <ol className="mt-5 divide-y divide-line">
            {lessons
              .filter((l) => l.moduleId === m.id)
              .map((l) => {
                const done = progress.completed.includes(l.id)
                const comingSoon = l.status === 'coming-soon'
                const unlocked = isUnlocked(l.id)
                const row = (
                  <div className="grid grid-cols-[4.75rem_1fr_auto] items-center gap-3 py-3.5 sm:grid-cols-[6rem_1fr_auto_auto]">
                    <span className="font-semibold whitespace-nowrap">Lesson {l.id}</span>
                    <span className={comingSoon ? 'text-muted' : ''}>{l.title}</span>
                    <span className="hidden text-sm text-muted tabular-nums sm:block">{l.durationMin} min</span>
                    <span className="flex justify-end">
                      {comingSoon ? (
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] whitespace-nowrap text-muted">Coming soon</span>
                      ) : done ? (
                        <span className="flex size-7 items-center justify-center rounded-full bg-gold text-on-gold" aria-label="Completed">
                          <CheckIcon width={16} height={16} />
                        </span>
                      ) : !unlocked ? (
                        <span className="text-muted" aria-label="Locked">
                          <LockIcon width={18} height={18} />
                        </span>
                      ) : (
                        <span className="text-sm text-gold sm:hidden">{l.durationMin}m</span>
                      )}
                    </span>
                  </div>
                )
                return (
                  <li key={l.id}>
                    {unlocked ? (
                      <Link to={`/lesson/${l.id}`} className="block rounded-lg px-2 transition-colors hover:bg-surface-2">
                        {row}
                      </Link>
                    ) : (
                      <div className="cursor-not-allowed px-2 opacity-60" aria-disabled="true" title={comingSoon ? 'Coming soon' : 'Complete the previous lesson to unlock'}>
                        {row}
                      </div>
                    )}
                  </li>
                )
              })}
          </ol>
        </section>
      ))}
    </div>
  )
}
