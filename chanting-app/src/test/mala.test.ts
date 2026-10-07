import { describe, expect, it } from 'vitest'
import { startMala, streak, tap, total, undo } from '../lib/mala'

describe('mala counter', () => {
  it('counts a full round of 108 and rings once', () => {
    let s = startMala(108)
    let rounds = 0
    for (let i = 0; i < 108; i++) {
      const r = tap(s)
      s = r.state
      if (r.roundDone) rounds++
    }
    expect(rounds).toBe(1)
    expect(s).toEqual({ count: 0, target: 108, rounds: 1 })
    expect(total(s)).toBe(108)
  })

  it('undo steps back across a round boundary', () => {
    let s = startMala(21)
    for (let i = 0; i < 22; i++) s = tap(s).state
    expect(total(s)).toBe(22)
    s = undo(undo(s))
    expect(s).toEqual({ count: 20, target: 21, rounds: 0 })
    expect(undo(startMala(21))).toEqual(startMala(21))
  })

  it('rejects silly targets', () => {
    expect(startMala(0).target).toBe(1)
    expect(startMala(7.9).target).toBe(7)
  })

  it('counts streaks ending today or yesterday', () => {
    expect(streak(['2026-10-05', '2026-10-06', '2026-10-07'], '2026-10-07')).toBe(3)
    expect(streak(['2026-10-05', '2026-10-06'], '2026-10-07')).toBe(2)
    expect(streak(['2026-10-04'], '2026-10-07')).toBe(0)
    expect(streak(['2026-09-30', '2026-10-01'], '2026-10-01')).toBe(2)
  })
})
