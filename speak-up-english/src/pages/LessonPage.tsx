import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { getLesson, lessons, modules } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import { ArrowLeftIcon, CheckIcon } from '../components/Icons'
import LearnTab from './lesson/LearnTab'
import PhrasesTab from './lesson/PhrasesTab'
import ListenTab from './lesson/ListenTab'
import PracticeTab from './lesson/PracticeTab'
import QuizTab from './lesson/QuizTab'

const TABS = ['learn', 'phrases', 'listen', 'practice', 'quiz'] as const
type Tab = (typeof TABS)[number]
const TAB_LABELS: Record<Tab, string> = { learn: 'Learn', phrases: 'Phrases', listen: 'Listen', practice: 'Practice', quiz: 'Quiz' }

export default function LessonPage() {
  const { id } = useParams()
  const lesson = getLesson(Number(id))
  const { isUnlocked, visitLesson, progress, completeLesson } = useProgress()
  const [params, setParams] = useSearchParams()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tab: Tab = TABS.includes(params.get('tab') as Tab) ? (params.get('tab') as Tab) : 'learn'

  const unlocked = lesson ? isUnlocked(lesson.id) : false
  useEffect(() => {
    if (lesson && unlocked) visitLesson(lesson.id)
  }, [lesson, unlocked, visitLesson])

  if (!lesson || !lesson.content || !unlocked) return <Navigate to="/course" replace />

  const c = lesson.content
  const module = modules.find((m) => m.id === lesson.moduleId)
  const done = progress.completed.includes(lesson.id)
  const idx = lessons.indexOf(lesson)
  const nextLesson = lessons[idx + 1]

  const selectTab = (t: Tab) => setParams({ tab: t }, { replace: true })
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const n = (i + dir + TABS.length) % TABS.length
    selectTab(TABS[n])
    tabRefs.current[n]?.focus()
  }

  return (
    <div className="space-y-6">
      <Link to="/course" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
        <ArrowLeftIcon width={16} height={16} /> All lessons
      </Link>

      <header>
        <p className="eyebrow">
          Module {module?.id} · {module?.title}
        </p>
        <h1 className="h-serif mt-2 text-4xl md:text-5xl">
          <span className="text-gold">Lesson {lesson.id}.</span> {lesson.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {c.goal} <span className="whitespace-nowrap">· {lesson.durationMin} min</span>
        </p>
      </header>

      <div role="tablist" aria-label="Lesson sections" className="sticky top-16 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-bg/90 px-4 py-2 backdrop-blur">
        {TABS.map((t, i) => (
          <button
            key={t}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => selectTab(t)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-colors ${tab === t ? 'bg-gold text-on-gold' : 'text-muted hover:text-ink'}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'learn' && <LearnTab content={c} />}
        {tab === 'phrases' && <PhrasesTab content={c} />}
        {tab === 'listen' && <ListenTab lessonId={lesson.id} content={c} />}
        {tab === 'practice' && <PracticeTab lessonId={lesson.id} content={c} />}
        {tab === 'quiz' && <QuizTab lessonId={lesson.id} questions={c.quiz} />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        {tab !== 'quiz' ? (
          <button type="button" className="btn-ghost" onClick={() => selectTab(TABS[TABS.indexOf(tab) + 1])}>
            Next: {TAB_LABELS[TABS[TABS.indexOf(tab) + 1]]} →
          </button>
        ) : (
          <span />
        )}
        {done ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-good">
              <CheckIcon width={16} height={16} /> Lesson completed
            </span>
            {nextLesson && nextLesson.status === 'available' && (
              <Link to={`/lesson/${nextLesson.id}`} className="btn-gold">Lesson {nextLesson.id} →</Link>
            )}
          </div>
        ) : (
          <button type="button" className="btn-gold" onClick={() => completeLesson(lesson.id)}>
            <CheckIcon width={16} height={16} /> Mark lesson complete
          </button>
        )}
      </div>
    </div>
  )
}
