import { describe, expect, it } from 'vitest'
import { parseTexts, RAW_TEXTS, TEXTS, timingProblems, type Text } from '../lib/content'

describe('content', () => {
  it('every text passes the schema', () => {
    expect(() => parseTexts(RAW_TEXTS)).not.toThrow()
    expect(TEXTS.map((t) => t.id)).toEqual(['om-mani', 'vajrasattva'])
  })

  it('the Hundred-Syllable Mantra has 17 phrases', () => {
    expect(TEXTS.find((t) => t.id === 'vajrasattva')!.phrases).toHaveLength(17)
  })

  for (const text of TEXTS) {
    describe(text.id, () => {
      it('phrase Tibetan equals its syllables joined with tsheg', () => {
        for (const p of text.phrases) expect(p.tib).toBe(p.syllables.map((s) => s.tib).join('་') + '།')
      })

      it('has English and Chinese for every meaning', () => {
        const all = [text.description, text.practiceNotes, ...text.phrases.flatMap((p) => [p.gloss, ...p.syllables.flatMap((s) => [s.word?.gloss, s.stack?.note])])]
        for (const b of all.filter(Boolean)) {
          expect(b!.en.trim()).not.toBe('')
          expect(b!.zh).toMatch(/[一-鿿]/)
        }
      })

      it('syllables are Tibetan script only and have every reading', () => {
        for (const s of text.phrases.flatMap((p) => p.syllables)) {
          expect(s.tib).toMatch(/^[ༀ-࿿]+$/)
          expect(s.phonZh).toMatch(/[一-鿿]/)
          expect(s.word).toBeDefined()
        }
      })

      it('phrase ids are unique', () => {
        expect(new Set(text.phrases.map((p) => p.id)).size).toBe(text.phrases.length)
      })

      it('timestamps (when present) increase', () => {
        expect(timingProblems(text)).toEqual([])
      })
    })
  }

  it('rejects content missing a translation or with an empty syllable', () => {
    const missingZh = structuredClone(RAW_TEXTS[0]) as Text
    delete (missingZh.phrases[0].gloss as { zh?: string }).zh
    expect(() => parseTexts([missingZh])).toThrow()
    const empty = structuredClone(RAW_TEXTS[0]) as Text
    empty.phrases[0].syllables[0].tib = ''
    expect(() => parseTexts([empty])).toThrow()
    const noPhrases = { ...(structuredClone(RAW_TEXTS[0]) as Text), phrases: [] }
    expect(() => parseTexts([noPhrases])).toThrow()
  })

  it('flags timestamps that go backwards', () => {
    const t = structuredClone(TEXTS[0]) as Text
    t.phrases[0].syllables[0].audio = { start: 1, end: 2 }
    t.phrases[0].syllables[1].audio = { start: 0.5, end: 0.4 }
    expect(timingProblems(t)).toHaveLength(2)
  })
})
