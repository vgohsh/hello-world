/** Pure speaking-feedback logic. No browser APIs here so it can be unit tested. */

export const FILLER_WORDS = [
  'um',
  'uh',
  'er',
  'erm',
  'hmm',
  'like',
  'you know',
  'basically',
  'actually',
  'literally',
  'kind of',
  'sort of',
  'i mean',
] as const

export const WPM_MIN = 120
export const WPM_MAX = 160

/** Lowercase, strip punctuation, collapse whitespace, split into words. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export type DiffOp =
  | { type: 'match'; word: string }
  | { type: 'missing'; word: string }
  | { type: 'extra'; word: string }
  | { type: 'wrong'; expected: string; actual: string }

export interface DiffResult {
  ops: DiffOp[]
  /** Share of target words that the learner said correctly, 0–100. */
  accuracy: number
}

/**
 * Word-level alignment of a target sentence against what was heard
 * (Levenshtein over words, with substitutions reported as "wrong").
 */
export function diffWords(target: string, spoken: string): DiffResult {
  const a = tokenize(target)
  const b = tokenize(spoken)
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i][0] = i
  for (let j = 0; j <= m; j++) dp[0][j] = j
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }

  const ops: DiffOp[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      ops.push({ type: 'match', word: a[i - 1] })
      i--
      j--
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({ type: 'wrong', expected: a[i - 1], actual: b[j - 1] })
      i--
      j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ type: 'missing', word: a[i - 1] })
      i--
    } else {
      ops.push({ type: 'extra', word: b[j - 1] })
      j--
    }
  }
  ops.reverse()

  const matches = ops.filter((o) => o.type === 'match').length
  const accuracy = n === 0 ? 0 : Math.round((matches / n) * 100)
  return { ops, accuracy }
}

export function wordsPerMinute(transcript: string, durationSec: number): number {
  if (durationSec <= 0) return 0
  return Math.round((tokenize(transcript).length / durationSec) * 60)
}

export interface FillerReport {
  total: number
  counts: Record<string, number>
}

export function countFillers(transcript: string): FillerReport {
  const words = tokenize(transcript)
  const counts: Record<string, number> = {}
  let total = 0
  for (let i = 0; i < words.length; i++) {
    // Prefer two-word fillers ("you know") over single ones.
    const pair = i + 1 < words.length ? `${words[i]} ${words[i + 1]}` : ''
    if (pair && (FILLER_WORDS as readonly string[]).includes(pair)) {
      counts[pair] = (counts[pair] ?? 0) + 1
      total++
      i++
      continue
    }
    const w = words[i]
    if ((FILLER_WORDS as readonly string[]).includes(w)) {
      counts[w] = (counts[w] ?? 0) + 1
      total++
    }
  }
  return { total, counts }
}

/**
 * Find silent stretches in a loudness envelope.
 * @param levels RMS level per frame (0–1)
 * @param frameSec seconds per frame
 * @param threshold level below which a frame counts as silent
 * @param minPauseSec only report pauses at least this long
 * Leading and trailing silence are ignored.
 */
export function detectPauses(
  levels: number[],
  frameSec: number,
  threshold = 0.02,
  minPauseSec = 1.2,
): number[] {
  const first = levels.findIndex((l) => l >= threshold)
  if (first === -1) return []
  let last = levels.length - 1
  while (last > first && levels[last] < threshold) last--

  const pauses: number[] = []
  let run = 0
  for (let i = first; i <= last; i++) {
    if (levels[i] < threshold) {
      run++
    } else {
      if (run * frameSec >= minPauseSec) pauses.push(Number((run * frameSec).toFixed(1)))
      run = 0
    }
  }
  return pauses
}

export interface SpeakingMetrics {
  transcript: string
  durationSec: number
  wpm: number
  fillers: FillerReport
  pauses: number[]
  accuracy?: number
}

export interface SpeakingFeedback {
  stars: number
  tips: string[]
}

export function buildFeedback(m: SpeakingMetrics): SpeakingFeedback {
  const wordCount = tokenize(m.transcript).length
  if (wordCount === 0) {
    return {
      stars: 0,
      tips: ['We could not hear any words. Check your microphone and speak a little closer to it.'],
    }
  }

  let score = 5
  const tips: string[] = []

  if (m.accuracy !== undefined) {
    if (m.accuracy < 60) {
      score -= 2
      tips.push('Listen to the model again and copy it in short chunks, then put the chunks together.')
    } else if (m.accuracy < 85) {
      score -= 1
      tips.push('Nearly there. Look at the highlighted words and repeat just those a few times.')
    }
  }

  if (m.durationSec >= 5) {
    if (m.wpm > WPM_MAX + 20) {
      score -= 1
      tips.push(`You spoke at ${m.wpm} words per minute. Slow down a little (aim for ${WPM_MIN}–${WPM_MAX}) so every word lands.`)
    } else if (m.wpm > 0 && m.wpm < WPM_MIN - 30) {
      score -= 1
      tips.push(`You spoke at ${m.wpm} words per minute. Try to keep the words flowing (aim for ${WPM_MIN}–${WPM_MAX}). Plan your next idea while you speak.`)
    }
  }

  const fillerRate = m.fillers.total / wordCount
  if (m.fillers.total >= 3 || fillerRate > 0.05) {
    score -= 1
    const top = Object.entries(m.fillers.counts).sort((x, y) => y[1] - x[1])[0]?.[0]
    tips.push(`You used ${m.fillers.total} filler words${top ? ` (mostly "${top}")` : ''}. Replace them with a short, silent pause.`)
  }

  const longPauses = m.pauses.filter((p) => p >= 2.5).length
  if (longPauses >= 2) {
    score -= 1
    tips.push('There were a few long pauses. Use linking phrases like "What I mean is…" or "The main point is…" to keep going.')
  }

  if (tips.length === 0) {
    tips.push('Great job! Your pace and fluency were strong. Next time, add one specific example to make it memorable.')
  }

  return { stars: Math.max(1, Math.min(5, score)), tips: tips.slice(0, 3) }
}
