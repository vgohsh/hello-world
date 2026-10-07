import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { SpeakerIcon, StopIcon } from './Icons'

interface Props {
  text: string
  id?: string
  label?: string
  rate?: number
  compact?: boolean
  /** Pick a different TTS voice (e.g. for the other person in a role-play). */
  voiceIndex?: number
}

export default function ListenButton({ text, id = text, label = 'Listen', rate, compact, voiceIndex = 0 }: Props) {
  const { supported, speakQueue, stop, speakingId } = useSpeechSynthesis()
  if (!supported) return null
  const active = speakingId === id
  return (
    <button
      type="button"
      className={compact ? 'btn-ghost !p-2' : 'btn-ghost'}
      onClick={() => (active ? stop() : speakQueue([{ text, voiceIndex }], id, rate))}
      aria-label={active ? 'Stop audio' : `${label}: ${text}`}
      aria-pressed={active}
    >
      {active ? <StopIcon width={16} height={16} /> : <SpeakerIcon width={16} height={16} />}
      {!compact && <span>{active ? 'Stop' : label}</span>}
    </button>
  )
}
