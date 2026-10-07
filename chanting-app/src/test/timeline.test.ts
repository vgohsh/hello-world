import { describe, expect, it } from 'vitest'
import { TEXTS } from '../lib/content'
import { alignedTimeline, phraseAt, syllableAt, syntheticTimeline } from '../lib/timeline'

const text = TEXTS.find((t) => t.id === 'vajrasattva')!

describe('timeline', () => {
  const tl = syntheticTimeline(text)

  it('covers every syllable in order', () => {
    expect(tl.syllables).toHaveLength(text.phrases.reduce((n, p) => n + p.syllables.length, 0))
    for (let i = 1; i < tl.syllables.length; i++) expect(tl.syllables[i].start).toBeGreaterThanOrEqual(tl.syllables[i - 1].end)
  })

  it('finds the syllable sounding at a time', () => {
    expect(syllableAt(tl, -1)).toBe(-1)
    expect(syllableAt(tl, 0)).toBe(0)
    const s = tl.syllables[10]
    expect(syllableAt(tl, (s.start + s.end) / 2)).toBe(10)
    expect(syllableAt(tl, s.start)).toBe(10)
    expect(syllableAt(tl, tl.duration + 5)).toBe(tl.syllables.length - 1)
  })

  it('keeps the last syllable of a phrase during the pause after it', () => {
    const p = tl.phrases[0]
    expect(syllableAt(tl, p.end + 0.1)).toBe(p.last)
    expect(phraseAt(tl, p.end + 0.1)).toBe(0)
    expect(phraseAt(tl, tl.phrases[1].start)).toBe(1)
  })

  it('builds from aligned timings and refuses incomplete ones', () => {
    let t = 0
    const timings = text.phrases.map((p) => ({ syllables: p.syllables.map(() => ({ start: t, end: (t += 0.5) })) }))
    const aligned = alignedTimeline(text, timings)!
    expect(aligned.synthetic).toBe(false)
    expect(aligned.duration).toBeCloseTo(t)
    expect(alignedTimeline(text, timings.slice(1))).toBeNull()
    expect(alignedTimeline(text)).toBeNull() // shipped content has no recordings yet
  })
})
