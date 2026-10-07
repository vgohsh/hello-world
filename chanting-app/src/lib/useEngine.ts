import { useEffect, useRef, useState } from 'react'
import { AudioEngine, type EngineState } from './audioEngine'
import type { Text } from './content'
import { db } from './db'
import { useSettings } from './settings'
import { alignedTimeline, syntheticTimeline } from './timeline'

/**
 * Builds the player for a text. Preference order: audio recorded with the alignment tool
 * on this device → audio shipped with the content → placeholder voice.
 */
export function useEngine(text: Text) {
  const { settings } = useSettings()
  const tradition = useRef(settings.tradition)
  tradition.current = settings.tradition
  const [engine, setEngine] = useState<AudioEngine | null>(null)
  const [state, setState] = useState<EngineState | null>(null)

  useEffect(() => {
    let cancelled = false
    let url: string | null = null
    let eng: AudioEngine | null = null
    let unsub: (() => void) | null = null
    void (async () => {
      let custom = null
      try {
        custom = await db.customAudio.get(text.id)
      } catch {
        /* IndexedDB unavailable */
      }
      if (cancelled) return
      let timeline = null
      let src: string | null = null
      if (custom) {
        timeline = alignedTimeline(text, custom.phrases)
        if (timeline) src = url = URL.createObjectURL(custom.blob)
      }
      if (!timeline && text.audio) {
        timeline = alignedTimeline(text)
        if (timeline) src = text.audio.src
      }
      timeline ??= syntheticTimeline(text)
      const syllables = text.phrases.flatMap((p) => p.syllables)
      eng = new AudioEngine(text, timeline, src, (i) => syllables[i].phon[tradition.current])
      unsub = eng.subscribe(setState)
      setEngine(eng)
    })()
    return () => {
      cancelled = true
      unsub?.()
      eng?.destroy()
      if (url) URL.revokeObjectURL(url)
      setEngine(null)
    }
  }, [text])

  return { engine, state }
}
