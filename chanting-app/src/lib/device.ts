/** Small wrappers around browser APIs that may be missing. Every call fails quietly. */

let lock: WakeLockSentinel | null = null

export async function keepAwake(on: boolean) {
  try {
    if (on && !lock && 'wakeLock' in navigator) {
      lock = await navigator.wakeLock.request('screen')
      lock.addEventListener('release', () => (lock = null))
    } else if (!on && lock) {
      await lock.release()
      lock = null
    }
  } catch {
    /* not allowed (e.g. page hidden) */
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}

let ctx: AudioContext | null = null

/** A soft temple-bell tone made with Web Audio, so no audio file is needed. */
export function bell() {
  try {
    ctx ??= new AudioContext()
    const now = ctx.currentTime
    for (const [freq, gain] of [[523.25, 0.25], [1046.5, 0.08], [1568, 0.04]] as const) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = freq
      g.gain.setValueAtTime(gain, now)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3)
      o.connect(g).connect(ctx.destination)
      o.start(now)
      o.stop(now + 3)
    }
  } catch {
    /* no audio */
  }
}
