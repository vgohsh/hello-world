import type { Text } from './content'
import { keepAwake } from './device'
import { phraseAt, syllableAt, type Timeline } from './timeline'

export type EngineState = {
  playing: boolean
  time: number
  rate: number
  syllable: number // index into timeline.syllables, -1 if none
  phrase: number
  loop: { a: number; b: number } | null
  callResponse: boolean
  yourTurn: boolean // call-and-response: the learner's turn to repeat
  stopAt: number | null
}

type Listener = (s: EngineState) => void

/**
 * Plays a text along a timeline. With a recording it drives an <audio> element;
 * without one it runs a virtual clock and speaks each syllable with the browser's
 * speech synthesis (a clearly-labelled placeholder voice).
 */
export class AudioEngine {
  readonly timeline: Timeline
  private text: Text
  private audio: HTMLAudioElement | null
  private state: EngineState
  private listeners = new Set<Listener>()
  private raf = 0
  private last = 0
  private turnTimer = 0
  private spoken = -1
  pronounce: (sylIndex: number) => string

  constructor(text: Text, timeline: Timeline, src: string | null, pronounce: (i: number) => string) {
    this.text = text
    this.timeline = timeline
    this.pronounce = pronounce
    this.audio = src ? new Audio(src) : null
    if (this.audio) {
      this.audio.preload = 'auto'
      this.audio.preservesPitch = true
    }
    this.state = { playing: false, time: 0, rate: 1, syllable: -1, phrase: 0, loop: null, callResponse: false, yourTurn: false, stopAt: null }
    this.setupMediaSession()
  }

  get synthetic() {
    return this.audio === null
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  getState() {
    return this.state
  }

  private set(patch: Partial<EngineState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((l) => l(this.state))
  }

  setRate(rate: number) {
    if (this.audio) this.audio.playbackRate = rate
    this.set({ rate })
  }

  setLoop(loop: { a: number; b: number } | null) {
    this.set({ loop })
  }

  loopPhrase(p: number | null) {
    if (p === null) return this.setLoop(null)
    const ph = this.timeline.phrases[p]
    this.setLoop({ a: ph.start, b: ph.end + 0.25 })
  }

  setCallResponse(on: boolean) {
    this.set({ callResponse: on, yourTurn: false })
  }

  /** Play one phrase once, then stop. */
  playPhrase(p: number) {
    const ph = this.timeline.phrases[p]
    this.playSpan(ph.start, ph.end + 0.15)
  }

  /** Play phrases first..last once, then stop. */
  playPhrases(first: number, last: number) {
    this.playSpan(this.timeline.phrases[first].start, this.timeline.phrases[last].end + 0.15)
  }

  playSyllable(i: number) {
    const s = this.timeline.syllables[i]
    this.playSpan(s.start, s.end)
  }

  playSpan(a: number, b: number) {
    this.pause()
    this.setLoop(null)
    this.seek(a)
    this.set({ stopAt: b })
    this.play()
  }

  playFromSyllable(i: number) {
    this.set({ stopAt: null })
    this.seek(this.timeline.syllables[i].start)
    this.play()
  }

  seek(t: number) {
    const time = Math.max(0, Math.min(t, this.timeline.duration))
    if (this.audio) this.audio.currentTime = time
    this.spoken = -1
    this.update(time)
  }

  play() {
    if (this.state.playing) return
    window.clearTimeout(this.turnTimer)
    if (this.state.time >= this.timeline.duration - 0.05) this.seek(0)
    if (this.audio) {
      this.audio.playbackRate = this.state.rate
      void this.audio.play().catch(() => this.pause())
    }
    this.last = performance.now()
    this.set({ playing: true, yourTurn: false })
    void keepAwake(true)
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
    this.tick()
  }

  pause() {
    cancelAnimationFrame(this.raf)
    window.clearTimeout(this.turnTimer)
    this.audio?.pause()
    if (this.synthetic) window.speechSynthesis?.cancel()
    this.set({ playing: false, yourTurn: false })
    void keepAwake(false)
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
  }

  toggle() {
    if (this.state.playing || this.state.yourTurn) this.pause()
    else this.play()
  }

  nextPhrase(dir: 1 | -1) {
    const p = Math.max(0, Math.min(this.timeline.phrases.length - 1, this.state.phrase + dir))
    this.seek(this.timeline.phrases[p].start)
    if (this.state.loop) this.loopPhrase(p)
  }

  destroy() {
    this.pause()
    this.listeners.clear()
    if (this.audio) this.audio.src = ''
  }

  private tick = () => {
    const now = performance.now()
    let t: number
    if (this.audio) t = this.audio.currentTime
    else t = this.state.time + ((now - this.last) / 1000) * this.state.rate
    this.last = now

    const { loop, stopAt, callResponse } = this.state
    if (loop && t >= loop.b) {
      this.seek(loop.a)
      this.raf = requestAnimationFrame(this.tick)
      return
    }
    if (stopAt !== null && t >= stopAt) {
      this.set({ stopAt: null })
      this.update(t)
      this.pause()
      return
    }
    if (callResponse && !loop) {
      const p = this.state.phrase
      const ph = this.timeline.phrases[p]
      if (t >= ph.end + 0.1 && p < this.timeline.phrases.length) {
        this.startTurn(p)
        return
      }
    }
    if (t >= this.timeline.duration) {
      this.update(this.timeline.duration)
      this.pause()
      return
    }
    this.update(t)
    this.raf = requestAnimationFrame(this.tick)
  }

  /** Call-and-response: pause for the learner to repeat, then continue with the next phrase. */
  private startTurn(p: number) {
    cancelAnimationFrame(this.raf)
    this.audio?.pause()
    const ph = this.timeline.phrases[p]
    const wait = ((ph.end - ph.start) * 1.2 * 1000) / this.state.rate
    this.set({ playing: false, yourTurn: true })
    this.turnTimer = window.setTimeout(() => {
      const next = p + 1
      if (next >= this.timeline.phrases.length) {
        this.set({ yourTurn: false })
        void keepAwake(false)
        return
      }
      this.seek(this.timeline.phrases[next].start)
      this.play()
    }, wait)
  }

  private update(time: number) {
    const syllable = syllableAt(this.timeline, time)
    const phrase = phraseAt(this.timeline, time)
    if (this.synthetic && this.state.playing && syllable !== this.spoken && syllable >= 0) {
      const sy = this.timeline.syllables[syllable]
      if (time < sy.end) {
        this.spoken = syllable
        this.speak(syllable)
      }
    }
    if (syllable !== this.state.syllable || phrase !== this.state.phrase || Math.abs(time - this.state.time) > 0.05) {
      this.set({ time, syllable, phrase })
    } else this.state.time = time
  }

  private speak(i: number) {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(this.pronounce(i))
    u.lang = 'en-US'
    u.rate = Math.max(0.5, Math.min(1.4, this.state.rate * 1.1))
    synth.speak(u)
  }

  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: this.text.title.en, artist: this.text.title.zh, album: 'Chant Tibetan' })
      navigator.mediaSession.setActionHandler('play', () => this.play())
      navigator.mediaSession.setActionHandler('pause', () => this.pause())
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextPhrase(1))
      navigator.mediaSession.setActionHandler('previoustrack', () => this.nextPhrase(-1))
    } catch {
      /* unsupported action */
    }
  }
}
