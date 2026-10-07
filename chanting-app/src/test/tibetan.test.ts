import { describe, expect, it } from 'vitest'
import { TEXTS } from '../lib/content'
import { analyze, componentName, hasStackOrSign, unstack } from '../lib/tibetan'
import { hiddenAt } from '../pages/Memorize'

const roles = (s: string) => analyze(s).parts.map((p) => `${p.role}:${p.char}`)

describe('syllable anatomy', () => {
  it('bsgrubs: every position filled', () => {
    expect(analyze('བསྒྲུབས').kind).toBe('native')
    expect(roles('བསྒྲུབས')).toEqual(['prefix:བ', 'superscript:ས', 'root:ྒ', 'subscript:ྲ', 'vowel:ུ', 'suffix:བ', 'postsuffix:ས'])
  })

  it("dga' : prefix, root, suffix", () => {
    expect(roles('དགའ')).toEqual(['prefix:ད', 'root:ག', 'suffix:འ'])
  })

  it('rgyal: superscript ra over ga with ya-ta', () => {
    expect(roles('རྒྱལ')).toEqual(['superscript:ར', 'root:ྒ', 'subscript:ྱ', 'suffix:ལ'])
  })

  it('lha: la written above ha (la-go)', () => {
    expect(roles('ལྷ')).toEqual(['superscript:ལ', 'root:ྷ'])
  })

  it('khams: root first when the last two are suffix + sa', () => {
    expect(roles('ཁམས')).toEqual(['root:ཁ', 'suffix:མ', 'postsuffix:ས'])
  })

  it('Sanskrit stacks are shown letter by letter', () => {
    expect(analyze('སཏྭ').kind).toBe('sanskrit')
    expect(roles('སཏྭ')).toEqual(['base:ས', 'base:ཏ', 'subjoined:ྭ'])
    expect(roles('ཧཱུྃ')).toEqual(['base:ཧ', 'vowel:ཱ', 'vowel:ུ', 'mark:ྃ'])
    expect(analyze('ཥྱོ').kind).toBe('sanskrit')
  })

  it('every mantra syllable can be analysed', () => {
    for (const s of TEXTS.flatMap((t) => t.phrases.flatMap((p) => p.syllables))) expect(analyze(s.tib).parts.length).toBeGreaterThan(0)
  })

  it('names stack parts', () => {
    expect(unstack('ྐ')).toBe('ཀ')
    expect(componentName('ྭ').en).toMatch(/wa-zur/)
    expect(componentName('ྟ').en).toBe('subjoined ta (ཏ)')
    expect(hasStackOrSign('བཛྲ')).toBe(true)
    expect(hasStackOrSign('མ')).toBe(false)
  })
})

describe('cloze levels', () => {
  it('hide more at each level', () => {
    const hidden = (l: number) => Array.from({ length: 6 }, (_, i) => hiddenAt(l, i)).filter(Boolean).length
    expect([1, 2, 3, 4].map(hidden)).toEqual([2, 3, 5, 6])
  })
})
