import { useEffect, useRef, useState } from 'react'

/** Draws a simple peak waveform of a Blob or URL, optionally only [start, end] seconds of it. */
export function Waveform({ source, start = 0, end, label }: { source: Blob | string; start?: number; end?: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const buf = typeof source === 'string' ? await (await fetch(source)).arrayBuffer() : await source.arrayBuffer()
        const ctx = new AudioContext()
        const audio = await ctx.decodeAudioData(buf)
        void ctx.close()
        if (cancelled || !ref.current) return
        const data = audio.getChannelData(0)
        const a = Math.floor(start * audio.sampleRate)
        const b = Math.min(data.length, Math.floor((end ?? audio.duration) * audio.sampleRate))
        const canvas = ref.current
        const w = (canvas.width = canvas.clientWidth * devicePixelRatio)
        const h = (canvas.height = canvas.clientHeight * devicePixelRatio)
        const g = canvas.getContext('2d')!
        g.clearRect(0, 0, w, h)
        g.fillStyle = getComputedStyle(canvas).color
        const step = Math.max(1, Math.floor((b - a) / w))
        for (let x = 0; x < w; x++) {
          let peak = 0
          for (let i = a + x * step; i < Math.min(b, a + (x + 1) * step); i++) peak = Math.max(peak, Math.abs(data[i]))
          const bar = Math.max(1, peak * h)
          g.fillRect(x, (h - bar) / 2, 1, bar)
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [source, start, end])
  return failed ? null : <canvas ref={ref} role="img" aria-label={label} className="h-16 w-full text-accent" />
}
