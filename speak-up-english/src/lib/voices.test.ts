import { describe, expect, it } from 'vitest'
import { rankVoices, splitSentences } from './voices'

const v = (name: string, lang = 'en-US') => ({ name, lang, voiceURI: name })

// Order roughly as Chrome on macOS returns them (alphabetical).
const macVoices = [
  v('Albert'), v('Bad News'), v('Bahh'), v('Bells'), v('Boing'), v('Bubbles'), v('Cellos'),
  v('Daniel', 'en-GB'), v('Eddy (English (US))'), v('Fred'), v('Good News'), v('Grandma (English (US))'),
  v('Jester'), v('Junior'), v('Karen', 'en-AU'), v('Ralph'), v('Samantha'), v('Superstar'),
  v('Trinoids'), v('Whisper'), v('Wobble'), v('Zarvox'), v('Amélie', 'fr-CA'),
  v('Google US English'), v('Google UK English Female', 'en-GB'),
]

describe('rankVoices', () => {
  it('never returns novelty voices', () => {
    const names = rankVoices(macVoices, 'en-US').map((x) => x.name)
    for (const bad of ['Albert', 'Bad News', 'Bahh', 'Bubbles', 'Whisper', 'Zarvox', 'Fred', 'Junior', 'Ralph']) {
      expect(names).not.toContain(bad)
    }
  })
  it('puts clear voices first for US English', () => {
    const names = rankVoices(macVoices, 'en-US').map((x) => x.name)
    expect(names.slice(0, 2)).toEqual(['Google US English', 'Samantha'])
    expect(names.indexOf('Samantha')).toBeLessThan(names.indexOf('Eddy (English (US))'))
  })
  it('uses British voices for en-GB', () => {
    const names = rankVoices(macVoices, 'en-GB').map((x) => x.name)
    expect(names).toEqual(['Google UK English Female', 'Daniel'])
  })
  it('prefers enhanced and Microsoft natural voices', () => {
    const list = [v('Microsoft Zira - English (United States)'), v('Microsoft Aria Online (Natural) - English (United States)'), v('Samantha'), v('Samantha (Enhanced)')]
    const names = rankVoices(list, 'en-US').map((x) => x.name)
    expect(names[0]).toBe('Microsoft Aria Online (Natural) - English (United States)')
    expect(names[1]).toBe('Samantha (Enhanced)')
  })
  it('falls back to any English voice when the accent is missing', () => {
    expect(rankVoices([v('Karen', 'en-AU'), v('Thomas', 'fr-FR')], 'en-GB').map((x) => x.name)).toEqual(['Karen'])
  })
})

describe('splitSentences', () => {
  it('keeps short text as one chunk', () => {
    expect(splitSentences("Hi! I don't think we've met. I'm Sam.")).toEqual(["Hi! I don't think we've met. I'm Sam."])
  })
  it('splits long text on sentence boundaries and packs sentences together', () => {
    const text = 'First sentence is here. Second one follows it. Third sentence ends the text.'
    expect(splitSentences(text, 50)).toEqual(['First sentence is here. Second one follows it.', 'Third sentence ends the text.'])
  })
  it('keeps closing quotes with the sentence', () => {
    expect(splitSentences('Say "Hi, I\'m Daniel." Then smile at them.', 25)).toEqual(['Say "Hi, I\'m Daniel."', 'Then smile at them.'])
  })
  it('breaks very long sentences on commas', () => {
    const long = Array(20).fill('this is a clause').join(', ') + '.'
    const parts = splitSentences(long, 80)
    expect(parts.length).toBeGreaterThan(1)
    expect(parts.every((p) => p.length <= 80)).toBe(true)
    expect(parts.join(' ')).toBe(long)
  })
  it('handles empty text', () => {
    expect(splitSentences('   ')).toEqual([])
  })
})
