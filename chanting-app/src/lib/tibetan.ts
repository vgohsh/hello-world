import type { Bilingual } from './content'

export type Letter = { tib: string; wylie: string; phon: string; tone: 'high' | 'low' }

/** The 30 consonants with approximate Central Tibetan (Lhasa) readings. */
export const CONSONANTS: Letter[] = [
  ['ཀ', 'ka', 'ka', 'high'], ['ཁ', 'kha', 'kha', 'high'], ['ག', 'ga', "k'a", 'low'], ['ང', 'nga', 'nga', 'low'],
  ['ཅ', 'ca', 'cha', 'high'], ['ཆ', 'cha', 'chha', 'high'], ['ཇ', 'ja', "ch'a", 'low'], ['ཉ', 'nya', 'nya', 'low'],
  ['ཏ', 'ta', 'ta', 'high'], ['ཐ', 'tha', 'tha', 'high'], ['ད', 'da', "t'a", 'low'], ['ན', 'na', 'na', 'low'],
  ['པ', 'pa', 'pa', 'high'], ['ཕ', 'pha', 'pha', 'high'], ['བ', 'ba', "p'a", 'low'], ['མ', 'ma', 'ma', 'low'],
  ['ཙ', 'tsa', 'tsa', 'high'], ['ཚ', 'tsha', 'tsha', 'high'], ['ཛ', 'dza', "ts'a", 'low'], ['ཝ', 'wa', 'wa', 'low'],
  ['ཞ', 'zha', 'sha', 'low'], ['ཟ', 'za', 'sa', 'low'], ['འ', "'a", 'a', 'low'], ['ཡ', 'ya', 'ya', 'low'],
  ['ར', 'ra', 'ra', 'low'], ['ལ', 'la', 'la', 'low'], ['ཤ', 'sha', 'sha', 'high'], ['ས', 'sa', 'sa', 'high'],
  ['ཧ', 'ha', 'ha', 'high'], ['ཨ', 'a', 'a', 'high'],
].map(([tib, wylie, phon, tone]) => ({ tib, wylie, phon, tone: tone as Letter['tone'] }))

export const VOWELS: { sign: string; example: string; wylie: string; name: Bilingual }[] = [
  { sign: 'ི', example: 'ཀི', wylie: 'i', name: { en: 'gigu (i)', zh: '基古（i）' } },
  { sign: 'ུ', example: 'ཀུ', wylie: 'u', name: { en: 'zhabkyu (u)', zh: '夏丘（u）' } },
  { sign: 'ེ', example: 'ཀེ', wylie: 'e', name: { en: 'drengbu (e)', zh: '浙布（e）' } },
  { sign: 'ོ', example: 'ཀོ', wylie: 'o', name: { en: 'naro (o)', zh: '那若（o）' } },
]

export type Role =
  | 'prefix' | 'superscript' | 'root' | 'subscript' | 'vowel' | 'suffix' | 'postsuffix'
  | 'base' | 'subjoined' | 'mark'

export const ROLE_NAMES: Record<Role, Bilingual> = {
  prefix: { en: 'prefix', zh: '前加字' },
  superscript: { en: 'superscript', zh: '上加字' },
  root: { en: 'root letter', zh: '基字' },
  subscript: { en: 'subscript', zh: '下加字' },
  vowel: { en: 'vowel', zh: '元音' },
  suffix: { en: 'suffix', zh: '后加字' },
  postsuffix: { en: 'second suffix', zh: '再后加字' },
  base: { en: 'letter', zh: '字母' },
  subjoined: { en: 'stacked letter', zh: '下叠字母' },
  mark: { en: 'mark', zh: '符号' },
}

const isBase = (c: string) => c >= 'ཀ' && c <= 'ཬ'
const isSub = (c: string) => c >= 'ྐ' && c <= 'ྼ'
const isVowel = (c: string) => (c >= 'ཱ' && c <= 'ཽ') || c === 'ྀ' || c === 'ཱྀ'
const isMark = (c: string) => c === 'ཾ' || c === 'ཿ' || c === 'ྂ' || c === 'ྃ' || c === '྄'

/** The full-size letter a subjoined letter stands for (ྐ → ཀ). */
export function unstack(c: string): string {
  const cp = c.codePointAt(0)!
  if (cp === 0x0fba) return 'ཝ'
  if (cp === 0x0fbb) return 'ཡ'
  if (cp === 0x0fbc) return 'ར'
  if (cp >= 0x0f90 && cp <= 0x0fb9) return String.fromCodePoint(cp - 0x50)
  return c
}

const SPECIAL: Record<string, Bilingual> = {
  'ྲ': { en: 'ra-ta (subjoined ra)', zh: '下加 ར（ra-ta）' },
  'ྱ': { en: 'ya-ta (subjoined ya)', zh: '下加 ཡ（ya-ta）' },
  'ླ': { en: 'la-ta (subjoined la)', zh: '下加 ལ（la-ta）' },
  'ྭ': { en: 'wa-zur (subjoined wa)', zh: '下加 ཝ（wa-zur）' },
  'ྷ': { en: 'subjoined ha (aspiration)', zh: '下加 ཧ（送气）' },
  'ཱ': { en: 'a-chung (lengthens the vowel)', zh: '长音符（a-chung）' },
  'ི': { en: 'gigu (vowel i)', zh: '元音 i（基古）' },
  'ུ': { en: 'zhabkyu (vowel u)', zh: '元音 u（夏丘）' },
  'ེ': { en: 'drengbu (vowel e)', zh: '元音 e（浙布）' },
  'ོ': { en: 'naro (vowel o)', zh: '元音 o（那若）' },
  'ྀ': { en: 'reversed gigu (Sanskrit ṛ / short i)', zh: '反写 i（梵文 ṛ）' },
  'ཾ': { en: 'anusvāra (nasal m)', zh: '随韵（鼻音 m）' },
  'ྃ': { en: 'nāda-bindu (nasal ng)', zh: '月点（鼻音）' },
  'ྂ': { en: 'candrabindu (nasal)', zh: '月点（鼻音）' },
  'ཿ': { en: 'visarga (breathy h)', zh: '止声符（轻送气 h）' },
  'ཥ': { en: 'ṣa (Sanskrit only; Tibetans read it "ka")', zh: 'ṣa（梵文专用，藏人读 "ka"）' },
  'ཊ': { en: 'ṭa (retroflex, Sanskrit only)', zh: 'ṭa（卷舌，梵文专用）' },
  'ཋ': { en: 'ṭha (retroflex, Sanskrit only)', zh: 'ṭha（卷舌，梵文专用）' },
  'ཌ': { en: 'ḍa (retroflex, Sanskrit only)', zh: 'ḍa（卷舌，梵文专用）' },
  'ཎ': { en: 'ṇa (retroflex, Sanskrit only)', zh: 'ṇa（卷舌，梵文专用）' },
}

/** Human name for any component of a syllable. */
export function componentName(c: string): Bilingual {
  if (SPECIAL[c]) return SPECIAL[c]
  if (isSub(c)) {
    const full = unstack(c)
    const l = CONSONANTS.find((x) => x.tib === full)
    const name = SPECIAL[full]?.en.split(' ')[0] ?? l?.wylie ?? full
    return { en: `subjoined ${name} (${full})`, zh: `下叠 ${full}` }
  }
  const l = CONSONANTS.find((x) => x.tib === c)
  if (l) return { en: `${l.wylie} (${l.phon})`, zh: `${l.wylie}（${l.phon}）` }
  return { en: c, zh: c }
}

type Stack = { base: string; subs: string[]; vowels: string[]; marks: string[] }

export function stacks(syl: string): Stack[] {
  const out: Stack[] = []
  for (const c of syl.normalize('NFD')) {
    if (isBase(c)) out.push({ base: c, subs: [], vowels: [], marks: [] })
    else if (!out.length) continue
    else if (isSub(c)) out[out.length - 1].subs.push(c)
    else if (isVowel(c)) out[out.length - 1].vowels.push(c)
    else if (isMark(c)) out[out.length - 1].marks.push(c)
  }
  return out
}

export type Part = { char: string; role: Role }
export type Analysis = { kind: 'native' | 'sanskrit'; parts: Part[] }

const PREFIXES = new Set(['ག', 'ད', 'བ', 'མ', 'འ'])
const SUPERS = new Set(['ར', 'ལ', 'ས'])
const SUBSCRIPTS = new Set(['ྱ', 'ྲ', 'ླ', 'ྭ'])
const SUFFIXES = new Set(['ག', 'ང', 'ད', 'ན', 'བ', 'མ', 'འ', 'ར', 'ལ', 'ས'])
const POST = new Set(['ས', 'ད'])
const NATIVE_VOWELS = new Set(['ི', 'ུ', 'ེ', 'ོ'])
// Letters only used to write Sanskrit (retroflexes, ṣa, kṣa) and their subjoined forms
const SANSKRIT_ONLY = new Set(['ཊ', 'ཋ', 'ཌ', 'ཎ', 'ཥ', 'ཀྵ', 'ྚ', 'ྛ', 'ྜ', 'ྞ', 'ྵ', 'ྐྵ'])
const bare = (s: Stack) => !s.subs.length && !s.vowels.length && !s.marks.length

function nativeAnalysis(st: Stack[]): Part[] | null {
  if (!st.length || st.length > 4) return null
  if (st.some((s) => SANSKRIT_ONLY.has(s.base) || s.subs.some((c) => SANSKRIT_ONLY.has(c)))) return null
  const marked = st.map((s, i) => (s.subs.length || s.vowels.length ? i : -1)).filter((i) => i >= 0)
  if (marked.length > 1) return null
  let r: number
  if (marked.length === 1) r = marked[0]
  else if (st.length <= 2) r = 0
  else if (st.length === 3) r = st[2].base === 'ས' && ['ག', 'ང', 'བ', 'མ'].includes(st[1].base) && !PREFIXES.has(st[0].base) ? 0 : 1
  else r = 1

  const root = st[r]
  if (root.marks.length || root.vowels.length > 1 || root.vowels.some((v) => !NATIVE_VOWELS.has(v))) return null
  const before = st.slice(0, r)
  const after = st.slice(r + 1)
  if (before.length > 1 || after.length > 2) return null
  if (before.some((s) => !bare(s) || !PREFIXES.has(s.base))) return null
  if (after[0] && (!bare(after[0]) || !SUFFIXES.has(after[0].base))) return null
  if (after[1] && (!bare(after[1]) || !POST.has(after[1].base))) return null

  const parts: Part[] = before.map((s) => ({ char: s.base, role: 'prefix' }))
  let subs = root.subs
  if (SUPERS.has(root.base) && subs.length && !SUBSCRIPTS.has(subs[0])) {
    parts.push({ char: root.base, role: 'superscript' }, { char: subs[0], role: 'root' })
    subs = subs.slice(1)
  } else parts.push({ char: root.base, role: 'root' })
  for (const s of subs) {
    if (!SUBSCRIPTS.has(s)) return null
    parts.push({ char: s, role: 'subscript' })
  }
  root.vowels.forEach((v) => parts.push({ char: v, role: 'vowel' }))
  if (after[0]) parts.push({ char: after[0].base, role: 'suffix' })
  if (after[1]) parts.push({ char: after[1].base, role: 'postsuffix' })
  return parts
}

/**
 * Break a syllable into its parts. Native Tibetan syllables get grammatical roles
 * (prefix, superscript, root…); Sanskrit syllables in Tibetan script are shown as stacks.
 */
export function analyze(syl: string): Analysis {
  const st = stacks(syl)
  const native = nativeAnalysis(st)
  if (native) return { kind: 'native', parts: native }
  const parts: Part[] = []
  for (const s of st) {
    parts.push({ char: s.base, role: 'base' })
    s.subs.forEach((c) => parts.push({ char: c, role: 'subjoined' }))
    s.vowels.forEach((c) => parts.push({ char: c, role: 'vowel' }))
    s.marks.forEach((c) => parts.push({ char: c, role: 'mark' }))
  }
  return { kind: 'sanskrit', parts }
}

/** True if a syllable contains a stack or a Sanskrit-only sign worth explaining. */
export function hasStackOrSign(syl: string): boolean {
  return stacks(syl).some((s) => s.subs.length > 0 || s.marks.length > 0 || s.vowels.some((v) => !NATIVE_VOWELS.has(v)) || SPECIAL[s.base] !== undefined)
}
