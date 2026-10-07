import * as z from 'zod/mini'
import omMani from '../content/om-mani.json'
import vajrasattva from '../content/vajrasattva.json'

const Bilingual = z.object({ en: z.string().check(z.minLength(1)), zh: z.string().check(z.minLength(1)) })
const Phon = z.object({ tibetan: z.string().check(z.minLength(1)), sanskrit: z.string().check(z.minLength(1)) })
const Span = z.object({ start: z.number().check(z.gte(0)), end: z.number().check(z.gt(0)) })

export const SyllableSchema = z.object({
  tib: z.string().check(z.minLength(1)),
  wylie: z.string().check(z.minLength(1)),
  iast: z.string().check(z.minLength(1)),
  phon: Phon,
  phonZh: z.string().check(z.minLength(1)),
  phonPinyin: z.string().check(z.minLength(1)),
  word: z.optional(z.object({ tib: z.string(), iast: z.string(), gloss: Bilingual })),
  stack: z.optional(z.object({ parts: z.array(z.string()).check(z.minLength(1)), note: Bilingual })),
  audio: z.optional(Span),
})

export const PhraseSchema = z.object({
  id: z.string(),
  tib: z.string().check(z.minLength(1)),
  iast: z.string().check(z.minLength(1)),
  wylie: z.string().check(z.minLength(1)),
  phon: Phon,
  phonZh: z.string().check(z.minLength(1)),
  phonPinyin: z.string().check(z.minLength(1)),
  gloss: Bilingual,
  syllables: z.array(SyllableSchema).check(z.minLength(1)),
  audio: z.optional(Span),
})

export const TextSchema = z.object({
  id: z.string(),
  title: z.object({ en: z.string(), zh: z.string(), bo: z.string() }),
  kind: z.enum(['mantra', 'prayer']),
  level: z.optional(z.number()),
  description: Bilingual,
  practiceNotes: Bilingual,
  audio: z.nullable(z.object({ src: z.string(), credit: z.string() })),
  verified: z.boolean(),
  verifyNotes: z.optional(z.array(z.string())),
  phrases: z.array(PhraseSchema).check(z.minLength(1)),
})

export type Syllable = z.infer<typeof SyllableSchema>
export type Phrase = z.infer<typeof PhraseSchema>
export type Text = z.infer<typeof TextSchema>
export type Bilingual = z.infer<typeof Bilingual>

export const RAW_TEXTS: unknown[] = [omMani, vajrasattva]

export function parseTexts(raw: unknown[]): Text[] {
  return raw
    .map((r) => TextSchema.parse(r))
    .sort((a, b) => (a.level ?? 99) - (b.level ?? 99))
}

export const TEXTS: Text[] = parseTexts(RAW_TEXTS)

export function getText(id: string | undefined): Text | undefined {
  return TEXTS.find((t) => t.id === id)
}

/** Problems that the schema can't express: timestamps must increase through the text. */
export function timingProblems(text: Text): string[] {
  const problems: string[] = []
  let last = -1
  text.phrases.forEach((p) =>
    p.syllables.forEach((s, i) => {
      if (!s.audio) return
      if (s.audio.end <= s.audio.start) problems.push(`${p.id}[${i}] ends before it starts`)
      if (s.audio.start < last) problems.push(`${p.id}[${i}] starts before the previous syllable`)
      last = s.audio.start
    }),
  )
  return problems
}

export function pick(b: Bilingual, lang: 'en' | 'zh'): string {
  return b[lang]
}
