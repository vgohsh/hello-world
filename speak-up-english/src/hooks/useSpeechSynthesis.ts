import { useCallback, useEffect, useRef, useState } from 'react'
import { useProgress } from './useProgress'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

export interface SpeakItem {
  text: string
  /** Different index → different voice (used for dialogue speakers). */
  voiceIndex?: number
}

export function useSpeechSynthesis() {
  const { settings } = useProgress()
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const cancelled = useRef(false)

  useEffect(() => {
    if (!supported) return
    const load = () => setAllVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [])

  const accentVoices = allVoices.filter((v) => v.lang.replace('_', '-').startsWith(settings.accent))
  const englishVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const voices = accentVoices.length ? accentVoices : englishVoices

  const pickVoice = useCallback(
    (voiceIndex = 0): { voice?: SpeechSynthesisVoice; pitch: number } => {
      const preferred = voices.find((v) => v.voiceURI === settings.voiceURI)
      const ordered = preferred ? [preferred, ...voices.filter((v) => v !== preferred)] : voices
      if (ordered.length === 0) return { pitch: 1 }
      const voice = ordered[voiceIndex % ordered.length]
      // If there are fewer voices than speakers, vary the pitch so speakers still sound different.
      const pitch = voiceIndex >= ordered.length ? 1 + 0.25 * (voiceIndex % 2 === 0 ? -1 : 1) : 1
      return { voice, pitch }
    },
    [voices, settings.voiceURI],
  )

  const stop = useCallback(() => {
    cancelled.current = true
    if (supported) window.speechSynthesis.cancel()
    setSpeakingId(null)
    setCurrentIndex(-1)
  }, [])

  /** Speak a list of items one after another. Resolves when finished or stopped. */
  const speakQueue = useCallback(
    (items: SpeakItem[], id: string, rateOverride?: number): Promise<void> => {
      if (!supported || items.length === 0) return Promise.resolve()
      window.speechSynthesis.cancel()
      cancelled.current = false
      setSpeakingId(id)
      return new Promise((resolve) => {
        const next = (i: number) => {
          if (cancelled.current || i >= items.length) {
            setSpeakingId((cur) => (cur === id ? null : cur))
            setCurrentIndex(-1)
            resolve()
            return
          }
          setCurrentIndex(i)
          const u = new SpeechSynthesisUtterance(items[i].text)
          const { voice, pitch } = pickVoice(items[i].voiceIndex ?? 0)
          if (voice) u.voice = voice
          u.lang = voice?.lang ?? settings.accent
          u.rate = rateOverride ?? settings.rate
          u.pitch = pitch
          u.onend = () => next(i + 1)
          u.onerror = () => next(i + 1)
          window.speechSynthesis.speak(u)
        }
        next(0)
      })
    },
    [pickVoice, settings.accent, settings.rate],
  )

  const speak = useCallback((text: string, id = text, rate?: number) => speakQueue([{ text }], id, rate), [speakQueue])

  return { supported, voices, speak, speakQueue, stop, speakingId, currentIndex }
}
