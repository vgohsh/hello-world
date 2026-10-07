/** Placeholder voice for single letters/syllables until real recordings exist. */
export function speak(text: string, rate = 0.8) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = rate
    synth.speak(u)
  } catch {
    /* unsupported */
  }
}
