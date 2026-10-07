import { describe, expect, it } from 'vitest'
import { buildFeedback, countFillers, detectPauses, diffWords, tokenize, wordsPerMinute } from './scoring'

describe('tokenize', () => {
  it('lowercases and strips punctuation', () => {
    expect(tokenize("Hi, I'm Anna — nice to meet you!")).toEqual(["hi", "i'm", 'anna', 'nice', 'to', 'meet', 'you'])
  })
  it('normalises curly apostrophes and hyphens', () => {
    expect(tokenize('I’m a well-known speaker')).toEqual(["i'm", 'a', 'well', 'known', 'speaker'])
  })
})

describe('diffWords', () => {
  it('gives 100% for an exact match, ignoring case and punctuation', () => {
    const r = diffWords('Nice to meet you.', 'nice to meet you')
    expect(r.accuracy).toBe(100)
    expect(r.ops.every((o) => o.type === 'match')).toBe(true)
  })
  it('marks missing words', () => {
    const r = diffWords('It is great to finally meet you', 'it is great to meet you')
    expect(r.ops).toContainEqual({ type: 'missing', word: 'finally' })
    expect(r.accuracy).toBe(86)
  })
  it('marks wrong and extra words', () => {
    const r = diffWords('I work in marketing', 'I work at the marketing')
    expect(r.ops.some((o) => o.type === 'wrong' || o.type === 'extra')).toBe(true)
    expect(r.accuracy).toBe(75)
  })
  it('handles empty input', () => {
    expect(diffWords('Hello there', '').accuracy).toBe(0)
    expect(diffWords('', '').accuracy).toBe(0)
  })
})

describe('wordsPerMinute', () => {
  it('computes words per minute', () => {
    expect(wordsPerMinute('one two three four five six seven eight nine ten', 5)).toBe(120)
  })
  it('returns 0 for zero duration', () => {
    expect(wordsPerMinute('hello', 0)).toBe(0)
  })
})

describe('countFillers', () => {
  it('counts single and multi-word fillers', () => {
    const r = countFillers('Um, I think, you know, it was like really, um, basically fine')
    expect(r.counts).toEqual({ um: 2, 'you know': 1, like: 1, basically: 1 })
    expect(r.total).toBe(5)
  })
  it('does not double count a two-word filler', () => {
    expect(countFillers('I mean it').counts).toEqual({ 'i mean': 1 })
  })
  it('returns zero when there are none', () => {
    expect(countFillers('Clear and simple sentence').total).toBe(0)
  })
})

describe('detectPauses', () => {
  const loud = 0.2
  const quiet = 0
  it('finds pauses between speech and ignores leading/trailing silence', () => {
    const levels = [quiet, quiet, loud, loud, ...Array(15).fill(quiet), loud, quiet, quiet, quiet]
    expect(detectPauses(levels, 0.1)).toEqual([1.5])
  })
  it('ignores short gaps', () => {
    const levels = [loud, ...Array(5).fill(quiet), loud]
    expect(detectPauses(levels, 0.1)).toEqual([])
  })
  it('returns nothing for pure silence', () => {
    expect(detectPauses(Array(20).fill(quiet), 0.1)).toEqual([])
  })
})

describe('buildFeedback', () => {
  const base = { durationSec: 30, pauses: [] as number[], fillers: { total: 0, counts: {} } }
  it('gives 5 stars for a clean answer', () => {
    const f = buildFeedback({ ...base, transcript: 'word '.repeat(70), wpm: 140 })
    expect(f.stars).toBe(5)
  })
  it('flags fast speech and fillers', () => {
    const f = buildFeedback({
      ...base,
      transcript: 'um um um ' + 'word '.repeat(40),
      wpm: 200,
      fillers: { total: 3, counts: { um: 3 } },
    })
    expect(f.stars).toBe(3)
    expect(f.tips.join(' ')).toMatch(/Slow down/)
    expect(f.tips.join(' ')).toMatch(/"um"/)
  })
  it('handles silence', () => {
    expect(buildFeedback({ ...base, transcript: '', wpm: 0 }).stars).toBe(0)
  })
})
