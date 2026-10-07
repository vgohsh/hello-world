import { useCallback, useEffect, useRef, useState } from 'react'
import { useProgress } from './useProgress'

// Minimal typings — the Web Speech API recognition types are not in lib.dom for all browsers.
interface RecognitionAlternative {
  transcript: string
}
interface RecognitionResult {
  isFinal: boolean
  0: RecognitionAlternative
}
interface RecognitionEvent {
  resultIndex: number
  results: ArrayLike<RecognitionResult>
}
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}
type RecognitionCtor = new () => Recognition

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const recognitionSupported = getCtor() !== null

export function useSpeechRecognition() {
  const { settings } = useProgress()
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<Recognition | null>(null)
  const finalRef = useRef('')
  const wantRef = useRef(false)

  useEffect(() => () => recRef.current?.abort(), [])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return
    recRef.current?.abort()
    const rec = new Ctor()
    rec.lang = settings.accent
    rec.continuous = true
    rec.interimResults = true
    finalRef.current = ''
    setTranscript('')
    setInterim('')
    setError(null)
    rec.onresult = (e) => {
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalRef.current = `${finalRef.current} ${r[0].transcript}`.trim()
        else interimText += r[0].transcript
      }
      setTranscript(finalRef.current)
      setInterim(interimText)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      setError(e.error === 'not-allowed' ? 'Microphone access was blocked. Please allow it in your browser settings.' : `Speech recognition error: ${e.error}`)
    }
    rec.onend = () => {
      // Some browsers stop after a short silence; restart while the user is still recording.
      if (wantRef.current) {
        try {
          rec.start()
          return
        } catch {
          /* fall through */
        }
      }
      setListening(false)
    }
    recRef.current = rec
    wantRef.current = true
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('Could not start speech recognition.')
    }
  }, [settings.accent])

  /** Stop and return the final transcript (waits briefly for last results). */
  const stop = useCallback(async (): Promise<string> => {
    wantRef.current = false
    recRef.current?.stop()
    await new Promise((r) => setTimeout(r, 600))
    setInterim('')
    setListening(false)
    return finalRef.current
  }, [])

  return { supported: recognitionSupported, listening, transcript, interim, error, start, stop }
}
