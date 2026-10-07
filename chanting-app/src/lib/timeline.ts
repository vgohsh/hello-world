import type { Text } from './content'
import type { SyllableTiming } from './db'

export type TimedSyllable = { p: number; s: number; start: number; end: number }
export type Timeline = {
  synthetic: boolean
  syllables: TimedSyllable[] // flattened, in order
  phrases: { start: number; end: number; first: number; last: number }[] // first/last = indices into syllables
  duration: number
}

const SYL = 0.62 // seconds per syllable at 1x for the placeholder voice
const GAP = 0.7 // pause between phrases

/** Placeholder timing used when no aligned recording exists. Longer syllables get more time. */
export function syntheticTimeline(text: Text): Timeline {
  const syllables: TimedSyllable[] = []
  const phrases: Timeline['phrases'] = []
  let t = 0
  text.phrases.forEach((ph, p) => {
    const first = syllables.length
    const start = t
    ph.syllables.forEach((sy, s) => {
      const len = SYL * (sy.phon.tibetan.length > 4 ? 1.35 : 1)
      syllables.push({ p, s, start: t, end: t + len })
      t += len
    })
    phrases.push({ start, end: t, first, last: syllables.length - 1 })
    t += GAP
  })
  return { synthetic: true, syllables, phrases, duration: t }
}

/** Timeline from aligned timestamps (content JSON or the alignment tool). */
export function alignedTimeline(text: Text, timings?: { syllables: SyllableTiming[] }[]): Timeline | null {
  const syllables: TimedSyllable[] = []
  const phrases: Timeline['phrases'] = []
  for (let p = 0; p < text.phrases.length; p++) {
    const ph = text.phrases[p]
    const first = syllables.length
    for (let s = 0; s < ph.syllables.length; s++) {
      const span = timings ? timings[p]?.syllables[s] : ph.syllables[s].audio
      if (!span) return null
      syllables.push({ p, s, start: span.start, end: span.end })
    }
    phrases.push({ start: syllables[first].start, end: syllables[syllables.length - 1].end, first, last: syllables.length - 1 })
  }
  return { synthetic: false, syllables, phrases, duration: syllables[syllables.length - 1].end }
}

/** Index of the syllable sounding at time t, or -1 (before start / in a gap before the first). Binary search. */
export function syllableAt(tl: Timeline, t: number): number {
  const a = tl.syllables
  let lo = 0
  let hi = a.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (a[mid].start <= t) {
      ans = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  if (ans === -1) return -1
  // in the gap after a phrase's last syllable we keep highlighting it until the next starts
  return ans
}

export function phraseAt(tl: Timeline, t: number): number {
  const i = syllableAt(tl, t)
  return i === -1 ? 0 : tl.syllables[i].p
}
