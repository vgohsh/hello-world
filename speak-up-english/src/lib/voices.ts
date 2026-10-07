/** Voice quality ranking for the Web Speech API. Pure so it can be unit tested. */

export interface VoiceLike {
  name: string
  lang: string
  voiceURI: string
}

/** macOS novelty / effect voices and old robotic MacinTalk voices — unclear for learners. */
const BLOCKED = [
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'good news',
  'hysterical', 'jester', 'organ', 'pipe organ', 'superstar', 'trinoids', 'whisper', 'wobble',
  'zarvox', 'fred', 'junior', 'ralph', 'kathy', 'princess',
]

/** Eloquence voices: understandable but robotic. Usable only as a last resort. */
const ELOQUENCE = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley']

/** Clear, natural voices commonly found on macOS, iOS, Windows and Android. */
const GOOD = [
  'samantha', 'alex', 'ava', 'allison', 'susan', 'tom', 'evan', 'nathan', 'zoe', 'joelle', 'noelle',
  'daniel', 'kate', 'serena', 'oliver', 'arthur', 'martha', 'stephanie', 'jamie',
  'aria', 'jenny', 'guy', 'libby', 'ryan', 'sonia', 'zira', 'david', 'mark', 'hazel', 'george', 'susan',
]

function baseName(name: string): string {
  // "Samantha (Enhanced)" → "samantha"; "Microsoft Aria Online (Natural) - English (United States)" → "microsoft aria online…"
  return name.toLowerCase().replace(/\s*\(.*$/, '').trim()
}

export function isBlockedVoice(v: VoiceLike): boolean {
  const n = baseName(v.name)
  return BLOCKED.includes(n)
}

export function voiceScore(v: VoiceLike, accent: string): number {
  const name = v.name.toLowerCase()
  const n = baseName(v.name)
  if (isBlockedVoice(v)) return -1000
  let score = 0
  const lang = v.lang.replace('_', '-')
  if (lang === accent) score += 20
  else if (lang.toLowerCase().startsWith('en')) score += 5
  if (/natural|neural|premium|enhanced/.test(name)) score += 50
  if (name.startsWith('google')) score += 40
  if (name.includes('microsoft') && name.includes('online')) score += 45
  const firstWord = n.replace(/^microsoft\s+/, '').split(/\s+/)[0]
  if (GOOD.includes(firstWord)) score += 30
  if (ELOQUENCE.includes(firstWord)) score -= 40
  return score
}

/**
 * English voices for the chosen accent, best first, with novelty voices removed.
 * Falls back to any English voice if none match the accent.
 */
export function rankVoices<T extends VoiceLike>(all: T[], accent: string): T[] {
  const english = all.filter((v) => v.lang.toLowerCase().startsWith('en') && !isBlockedVoice(v))
  const accentMatch = english.filter((v) => v.lang.replace('_', '-') === accent)
  const pool = accentMatch.length ? accentMatch : english
  return [...pool].sort((a, b) => voiceScore(b, accent) - voiceScore(a, accent))
}

/**
 * Split long text into chunks of whole sentences (Chrome cuts off utterances
 * longer than ~15 seconds). Short text stays as one chunk so it sounds natural.
 */
export function splitSentences(text: string, maxLen = 220): string[] {
  const clean = text.trim()
  if (!clean) return []
  if (clean.length <= maxLen) return [clean]

  const sentences = (clean.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [clean]).map((p) => p.trim()).filter(Boolean)
  // Break any single over-long sentence on commas.
  const pieces: string[] = []
  for (const sentence of sentences) {
    if (sentence.length <= maxLen) {
      pieces.push(sentence)
      continue
    }
    let buf = ''
    for (const part of sentence.split(/(?<=,)\s+/)) {
      if (buf && `${buf} ${part}`.length > maxLen) {
        pieces.push(buf)
        buf = part
      } else buf = buf ? `${buf} ${part}` : part
    }
    if (buf) pieces.push(buf)
  }
  // Pack pieces back together up to maxLen.
  const chunks: string[] = []
  for (const piece of pieces) {
    const last = chunks[chunks.length - 1]
    if (last && `${last} ${piece}`.length <= maxLen) chunks[chunks.length - 1] = `${last} ${piece}`
    else chunks.push(piece)
  }
  return chunks
}
