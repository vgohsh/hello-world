import { describe, expect, it } from 'vitest'
import { isDue, newCard, review } from '../lib/srs'

const DAY = 86_400_000
const now = 1_700_000_000_000

describe('srs', () => {
  it('new cards are due now', () => {
    expect(isDue(newCard('t', 'p1', now), now)).toBe(true)
  })

  it('good answers grow the interval: 1 day, 3 days, then × ease', () => {
    let c = newCard('t', 'p1', now)
    c = review(c, 'good', now)
    expect(c.interval).toBe(1)
    c = review(c, 'good', now)
    expect(c.interval).toBe(3)
    c = review(c, 'good', now)
    expect(c.interval).toBeCloseTo(3 * 2.5, 1)
    expect(c.due).toBe(now + c.interval * DAY)
  })

  it('"again" resets and brings the phrase back in 10 minutes', () => {
    let c = review(review(newCard('t', 'p1', now), 'good', now), 'good', now)
    c = review(c, 'again', now)
    expect(c.reps).toBe(0)
    expect(c.lapses).toBe(1)
    expect(c.due).toBe(now + 10 * 60_000)
    expect(c.ease).toBeLessThan(2.5)
  })

  it('ease never drops below 1.3', () => {
    let c = newCard('t', 'p1', now)
    for (let i = 0; i < 20; i++) c = review(c, 'again', now)
    expect(c.ease).toBe(1.3)
  })

  it('easy beats good beats hard', () => {
    const base = review(review(newCard('t', 'p', now), 'good', now), 'good', now)
    const [h, g, e] = (['hard', 'good', 'easy'] as const).map((x) => review(base, x, now).interval)
    expect(h).toBeLessThan(g)
    expect(g).toBeLessThan(e)
  })
})
