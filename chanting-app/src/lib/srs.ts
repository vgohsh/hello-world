import type { SrsCard } from './db'

export type Grade = 'again' | 'hard' | 'good' | 'easy'
const DAY = 86_400_000
const Q: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 }

export function newCard(textId: string, phraseId: string, now = Date.now()): SrsCard {
  return { textId, phraseId, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now }
}

/** SM-2 variant. Intervals are in days; "again" brings the phrase back in 10 minutes. */
export function review(card: SrsCard, grade: Grade, now = Date.now()): SrsCard {
  const q = Q[grade]
  const ease = Math.max(1.3, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  if (grade === 'again') {
    return { ...card, ease, reps: 0, lapses: card.lapses + 1, interval: 0, due: now + 10 * 60_000 }
  }
  let interval: number
  if (card.reps === 0) interval = grade === 'easy' ? 3 : 1
  else if (card.reps === 1) interval = grade === 'hard' ? 2 : grade === 'easy' ? 5 : 3
  else interval = card.interval * (grade === 'hard' ? 1.2 : grade === 'easy' ? ease * 1.3 : ease)
  interval = Math.round(interval * 10) / 10
  return { ...card, ease, reps: card.reps + 1, interval, due: now + interval * DAY }
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.due <= now
}
