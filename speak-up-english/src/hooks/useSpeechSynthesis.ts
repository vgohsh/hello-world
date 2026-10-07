import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useProgress } from './useProgress'
import { rankVoices, splitSentences } from '../lib/voices'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

export interface SpeakItem {
  text: string
  /** Different index → different voice (used for dialogue speakers). */
  voiceIndex?: number
}

// ── One shared speech controller for the whole app ──────────────────────────
// Every Listen button uses this, so starting new audio always stops the old
// queue (otherwise two queues would talk over each other).

interface SpeechState {
  speakingId: string | null
  currentIndex: number
}

let state: SpeechState = { speakingId: null, currentIndex: -1 }
let generation = 0
const listeners = new Set<() => void>()

function setState(next: SpeechState) {
  state = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function stopSpeech() {
  generation++
  if (supported) window.speechSynthesis.cancel()
  if (state.speakingId !== null) setState({ speakingId: null, currentIndex: -1 })
}

let voiceCache: SpeechSynthesisVoice[] = []
const voiceListeners = new Set<() => void>()
if (supported) {
  const load = () => {
    voiceCache = window.speechSynthesis.getVoices()
    voiceListeners.forEach((l) => l())
  }
  load()
  window.speechSynthesis.addEventListener('voiceschanged', load)
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useSpeechSynthesis() {
  const { settings } = useProgress()
  const { speakingId, currentIndex } = useSyncExternalStore(subscribe, () => state)
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>(voiceCache)

  useEffect(() => {
    const update = () => setAllVoices(voiceCache)
    voiceListeners.add(update)
    update()
    return () => {
      voiceListeners.delete(update)
    }
  }, [])

  // Best voices first; novelty voices (e.g. macOS "Albert", "Bubbles") are removed.
  const voices = useMemo(() => rankVoices(allVoices, settings.accent), [allVoices, settings.accent])

  const pickVoice = useCallback(
    (voiceIndex = 0): { voice?: SpeechSynthesisVoice; pitch: number } => {
      const preferred = voices.find((v) => v.voiceURI === settings.voiceURI)
      const ordered = preferred ? [preferred, ...voices.filter((v) => v !== preferred)] : voices
      if (ordered.length === 0) return { pitch: 1 }
      // Only rotate among the top few voices so every speaker sounds clear.
      const top = ordered.slice(0, Math.min(ordered.length, 3))
      const voice = top[voiceIndex % top.length]
      // If there are fewer good voices than speakers, vary the pitch slightly.
      const pitch = voiceIndex >= top.length ? (voiceIndex % 2 === 0 ? 0.92 : 1.08) : 1
      return { voice, pitch }
    },
    [voices, settings.voiceURI],
  )

  /** Speak a list of items one after another. Resolves when finished or stopped. */
  const speakQueue = useCallback(
    (items: SpeakItem[], id: string, rateOverride?: number): Promise<void> => {
      if (!supported || items.length === 0) return Promise.resolve()
      stopSpeech()
      const myGen = generation
      setState({ speakingId: id, currentIndex: 0 })

      // Speak sentence by sentence (Chrome stops long utterances after ~15 s),
      // but report progress by the caller's item index.
      const chunks = items.flatMap((item, itemIndex) =>
        splitSentences(item.text).map((text) => ({ text, voiceIndex: item.voiceIndex ?? 0, itemIndex })),
      )

      return new Promise((resolve) => {
        const next = (i: number) => {
          if (myGen !== generation) return resolve()
          if (i >= chunks.length) {
            setState({ speakingId: null, currentIndex: -1 })
            return resolve()
          }
          if (state.currentIndex !== chunks[i].itemIndex) setState({ speakingId: id, currentIndex: chunks[i].itemIndex })
          const u = new SpeechSynthesisUtterance(chunks[i].text)
          const { voice, pitch } = pickVoice(chunks[i].voiceIndex)
          if (voice) u.voice = voice
          u.lang = voice?.lang ?? settings.accent
          u.rate = rateOverride ?? settings.rate
          u.pitch = pitch
          u.onend = () => next(i + 1)
          u.onerror = (e) => {
            // "interrupted"/"canceled" means newer audio took over — stop this queue.
            if (e.error === 'interrupted' || e.error === 'canceled') return resolve()
            next(i + 1)
          }
          window.speechSynthesis.speak(u)
        }
        // Chrome on macOS can drop or garble speech queued in the same tick as cancel().
        setTimeout(() => next(0), 60)
      })
    },
    [pickVoice, settings.accent, settings.rate],
  )

  const speak = useCallback((text: string, id = text, rate?: number) => speakQueue([{ text }], id, rate), [speakQueue])

  return { supported, voices, speak, speakQueue, stop: stopSpeech, speakingId, currentIndex }
}
