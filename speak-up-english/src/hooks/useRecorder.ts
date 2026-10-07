import { useCallback, useEffect, useRef, useState } from 'react'

export const FRAME_SEC = 0.1

export interface Recording {
  url: string
  durationSec: number
  /** RMS loudness per FRAME_SEC frame, used for pause detection. */
  levels: number[]
}

export const recorderSupported =
  typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

export function useRecorder() {
  const [recording, setRecording] = useState(false)
  const [level, setLevel] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const levelsRef = useRef<number[]>([])
  const startRef = useRef(0)

  const cleanup = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
  }, [])

  useEffect(() => cleanup, [cleanup])

  const start = useCallback(async (): Promise<boolean> => {
    setError(null)
    if (!recorderSupported) {
      setError('Audio recording is not supported in this browser.')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const media = new MediaRecorder(stream)
      chunksRef.current = []
      levelsRef.current = []
      media.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      mediaRef.current = media

      const ctx = new AudioContext()
      ctxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      ctx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Float32Array(analyser.fftSize)

      startRef.current = performance.now()
      timerRef.current = window.setInterval(() => {
        analyser.getFloatTimeDomainData(buf)
        let sum = 0
        for (const v of buf) sum += v * v
        const rms = Math.sqrt(sum / buf.length)
        levelsRef.current.push(rms)
        setLevel(rms)
        setElapsed((performance.now() - startRef.current) / 1000)
      }, FRAME_SEC * 1000)

      media.start()
      setRecording(true)
      return true
    } catch (e) {
      cleanup()
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Please allow it in your browser settings.'
          : 'Could not access the microphone.',
      )
      return false
    }
  }, [cleanup])

  const stop = useCallback((): Promise<Recording | null> => {
    const media = mediaRef.current
    if (!media || media.state === 'inactive') return Promise.resolve(null)
    return new Promise((resolve) => {
      media.onstop = () => {
        const durationSec = (performance.now() - startRef.current) / 1000
        const blob = new Blob(chunksRef.current, { type: media.mimeType || 'audio/webm' })
        cleanup()
        setRecording(false)
        setLevel(0)
        resolve({ url: URL.createObjectURL(blob), durationSec, levels: levelsRef.current })
      }
      media.stop()
    })
  }, [cleanup])

  return { supported: recorderSupported, recording, level, elapsed, error, start, stop }
}
