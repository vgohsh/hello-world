import Dexie, { type EntityTable } from 'dexie'

export type SrsCard = {
  textId: string
  phraseId: string
  ease: number
  interval: number // days
  reps: number
  lapses: number
  due: number // epoch ms
}
export type Tally = { textId: string; day: string; count: number }
export type Goal = { textId: string; goal: number }
export type MemoryRun = { id?: number; textId: string; peeks: number; seconds: number; at: number }
export type Recording = { id?: number; textId: string; phraseId: string; blob: Blob; duration: number; at: number }
export type SyllableTiming = { start: number; end: number }
export type CustomAudio = {
  textId: string
  name: string
  blob: Blob
  phrases: { syllables: SyllableTiming[] }[]
}
export type Progress = { textId: string; listened: boolean; chainStep: number; drillBest: number }

export const db = new Dexie('chant') as Dexie & {
  srs: EntityTable<SrsCard, 'phraseId'>
  tally: EntityTable<Tally, 'day'>
  goals: EntityTable<Goal, 'textId'>
  runs: EntityTable<MemoryRun, 'id'>
  recordings: EntityTable<Recording, 'id'>
  customAudio: EntityTable<CustomAudio, 'textId'>
  progress: EntityTable<Progress, 'textId'>
}

db.version(1).stores({
  srs: '[textId+phraseId], textId, due',
  tally: '[textId+day], textId, day',
  goals: 'textId',
  runs: '++id, textId',
  recordings: '++id, [textId+phraseId], textId',
  customAudio: 'textId',
  progress: 'textId',
})

export function today(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export async function getProgress(textId: string): Promise<Progress> {
  return (await db.progress.get(textId)) ?? { textId, listened: false, chainStep: 0, drillBest: 0 }
}

export async function patchProgress(textId: string, patch: Partial<Progress>) {
  const cur = await getProgress(textId)
  await db.progress.put({ ...cur, ...patch })
}

const pending = new Map<string, { textId: string; day: string; n: number }>()
let flushing: Promise<void> | null = null

async function flush(): Promise<void> {
  while (pending.size) {
    const batch = [...pending.values()]
    pending.clear()
    await db.transaction('rw', db.tally, async () => {
      for (const { textId, day, n } of batch) {
        const cur = await db.tally.get({ textId, day } as never)
        await db.tally.put({ textId, day, count: Math.max(0, (cur?.count ?? 0) + n) })
      }
    })
  }
}

/**
 * Add to a day's recitation count. Rapid taps are merged into one write so the
 * saved total keeps up with the counter.
 */
export function addTally(textId: string, n: number, day = today()): Promise<void> {
  const key = `${textId}|${day}`
  const cur = pending.get(key)
  pending.set(key, { textId, day, n: (cur?.n ?? 0) + n })
  return schedule()
}

function schedule(): Promise<void> {
  flushing ??= flush().finally(() => {
    flushing = null
    if (pending.size) void schedule() // taps that arrived as the last write finished
  })
  return flushing
}
