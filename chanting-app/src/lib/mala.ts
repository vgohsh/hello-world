export type MalaState = { count: number; target: number; rounds: number }

export function startMala(target: number): MalaState {
  return { count: 0, target: Math.max(1, Math.floor(target)), rounds: 0 }
}

/** Returns the next state and whether this tap completed a round. */
export function tap(s: MalaState): { state: MalaState; roundDone: boolean } {
  const count = s.count + 1
  if (count >= s.target) return { state: { ...s, count: 0, rounds: s.rounds + 1 }, roundDone: true }
  return { state: { ...s, count }, roundDone: false }
}

export function undo(s: MalaState): MalaState {
  if (s.count > 0) return { ...s, count: s.count - 1 }
  if (s.rounds > 0) return { ...s, rounds: s.rounds - 1, count: s.target - 1 }
  return s
}

export function total(s: MalaState): number {
  return s.rounds * s.target + s.count
}

/** Consecutive days (ending today or yesterday) that have any recitations. */
export function streak(days: string[], todayStr: string): number {
  const set = new Set(days)
  const d = new Date(todayStr + 'T12:00:00')
  if (!set.has(todayStr)) d.setDate(d.getDate() - 1)
  let n = 0
  for (;;) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!set.has(key)) return n
    n++
    d.setDate(d.getDate() - 1)
  }
}
