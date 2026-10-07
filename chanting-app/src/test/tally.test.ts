import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { addTally, db } from '../lib/db'

describe('tally', () => {
  it('keeps every one of many rapid taps, and undo never goes below zero', async () => {
    const writes = Array.from({ length: 250 }, () => addTally('vajrasattva', 1, '2026-10-07'))
    await Promise.all(writes)
    await addTally('vajrasattva', 1, '2026-10-07')
    expect((await db.tally.get({ textId: 'vajrasattva', day: '2026-10-07' } as never))?.count).toBe(251)
    await addTally('om-mani', -3, '2026-10-07')
    expect((await db.tally.get({ textId: 'om-mani', day: '2026-10-07' } as never))?.count).toBe(0)
  })
})
