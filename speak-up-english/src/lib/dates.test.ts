import { describe, expect, it } from 'vitest'
import { computeStreak, todayKey } from './dates'

describe('computeStreak', () => {
  const now = new Date(2026, 9, 7)
  const day = (offset: number) => todayKey(new Date(2026, 9, 7 - offset))
  it('counts consecutive days including today', () => {
    expect(computeStreak([day(0), day(1), day(2), day(4)], now)).toBe(3)
  })
  it('keeps the streak if the last activity was yesterday', () => {
    expect(computeStreak([day(1), day(2)], now)).toBe(2)
  })
  it('is zero after a missed day', () => {
    expect(computeStreak([day(2), day(3)], now)).toBe(0)
  })
})
