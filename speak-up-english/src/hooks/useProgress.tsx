import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, removeKey, saveJSON } from '../lib/storage'
import { computeStreak, todayKey } from '../lib/dates'
import { lessons } from '../data/lessons'

const PROGRESS_KEY = 'speakup.progress.v1'
const SETTINGS_KEY = 'speakup.settings.v1'

export type AttemptKind = 'shadowing' | 'roleplay' | 'free' | 'pronunciation'

export interface Attempt {
  date: string
  at: number
  lessonId: number
  kind: AttemptKind
  stars: number
  wpm?: number
  fillers?: number
  accuracy?: number
}

export interface Progress {
  completed: number[]
  lastLessonId: number | null
  activeDays: string[]
  attempts: Attempt[]
  quizScores: Record<number, number>
}

export type Accent = 'en-US' | 'en-GB'
export type Theme = 'dark' | 'light'

export interface Settings {
  accent: Accent
  voiceURI: string | null
  rate: number
  theme: Theme
  unlockAll: boolean
}

const defaultProgress: Progress = { completed: [], lastLessonId: null, activeDays: [], attempts: [], quizScores: {} }
const defaultSettings: Settings = { accent: 'en-US', voiceURI: null, rate: 0.95, theme: 'dark', unlockAll: false }

interface ProgressContextValue {
  progress: Progress
  settings: Settings
  streak: number
  updateSettings: (patch: Partial<Settings>) => void
  visitLesson: (id: number) => void
  completeLesson: (id: number) => void
  recordAttempt: (a: Omit<Attempt, 'date' | 'at'>) => void
  recordQuiz: (lessonId: number, score: number) => void
  isUnlocked: (id: number) => boolean
  resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => loadJSON(PROGRESS_KEY, defaultProgress))
  const [settings, setSettings] = useState<Settings>(() => loadJSON(SETTINGS_KEY, defaultSettings))

  useEffect(() => saveJSON(PROGRESS_KEY, progress), [progress])
  useEffect(() => {
    saveJSON(SETTINGS_KEY, settings)
    document.documentElement.dataset.theme = settings.theme
  }, [settings])

  const markActive = (p: Progress): Progress => {
    const today = todayKey()
    return p.activeDays.includes(today) ? p : { ...p, activeDays: [...p.activeDays, today] }
  }

  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), [])

  const visitLesson = useCallback((id: number) => setProgress((p) => (p.lastLessonId === id ? p : { ...p, lastLessonId: id })), [])

  const completeLesson = useCallback(
    (id: number) =>
      setProgress((p) => markActive(p.completed.includes(id) ? p : { ...p, completed: [...p.completed, id] })),
    [],
  )

  const recordAttempt = useCallback(
    (a: Omit<Attempt, 'date' | 'at'>) =>
      setProgress((p) => markActive({ ...p, attempts: [...p.attempts, { ...a, date: todayKey(), at: Date.now() }].slice(-500) })),
    [],
  )

  const recordQuiz = useCallback(
    (lessonId: number, score: number) =>
      setProgress((p) =>
        markActive({ ...p, quizScores: { ...p.quizScores, [lessonId]: Math.max(score, p.quizScores[lessonId] ?? 0) } }),
      ),
    [],
  )

  const isUnlocked = useCallback(
    (id: number) => {
      const lesson = lessons.find((l) => l.id === id)
      if (!lesson || lesson.status !== 'available') return false
      if (settings.unlockAll) return true
      const idx = lessons.indexOf(lesson)
      return idx === 0 || progress.completed.includes(lessons[idx - 1].id)
    },
    [progress.completed, settings.unlockAll],
  )

  const resetProgress = useCallback(() => {
    removeKey(PROGRESS_KEY)
    setProgress(defaultProgress)
  }, [])

  const value = useMemo(
    () => ({
      progress,
      settings,
      streak: computeStreak(progress.activeDays),
      updateSettings,
      visitLesson,
      completeLesson,
      recordAttempt,
      recordQuiz,
      isUnlocked,
      resetProgress,
    }),
    [progress, settings, updateSettings, visitLesson, completeLesson, recordAttempt, recordQuiz, isUnlocked, resetProgress],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>')
  return ctx
}
