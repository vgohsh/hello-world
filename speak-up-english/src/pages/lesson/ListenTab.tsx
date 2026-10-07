import type { LessonContent } from '../../types/lesson'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import ListenButton from '../../components/ListenButton'
import SpeakRecorder from '../../components/SpeakRecorder'
import { PlayIcon, StopIcon } from '../../components/Icons'

export default function ListenTab({ lessonId, content }: { lessonId: number; content: LessonContent }) {
  const { dialogue, pronunciation } = content
  const tts = useSpeechSynthesis()
  const playing = tts.speakingId === 'dialogue'

  const play = () =>
    playing
      ? tts.stop()
      : tts.speakQueue(
          dialogue.lines.map((l) => ({ text: l.text, voiceIndex: dialogue.speakers.indexOf(l.speaker) })),
          'dialogue',
        )

  return (
    <div className="space-y-8">
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Model dialogue</p>
            <h2 className="h-serif mt-1 text-2xl">{dialogue.title}</h2>
            <p className="mt-1 text-sm text-muted">{dialogue.scene}</p>
          </div>
          {tts.supported && (
            <button type="button" className="btn-gold" onClick={play} aria-pressed={playing}>
              {playing ? <StopIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
              {playing ? 'Stop' : 'Play dialogue'}
            </button>
          )}
        </div>
        <ol className="mt-5 space-y-2">
          {dialogue.lines.map((l, i) => {
            const active = playing && tts.currentIndex === i
            const side = dialogue.speakers.indexOf(l.speaker) % 2
            return (
              <li
                key={i}
                className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${active ? 'bg-gold-soft ring-1 ring-gold' : side ? 'bg-surface-2' : ''}`}
                aria-current={active ? 'true' : undefined}
              >
                <span className="w-16 shrink-0 text-sm font-semibold text-gold">{l.speaker}</span>
                <span className="flex-1">{l.text}</span>
                <ListenButton text={l.text} id={`line-${i}`} compact />
              </li>
            )
          })}
        </ol>
      </section>

      <section>
        <p className="eyebrow">Pronunciation</p>
        <h2 className="h-serif mt-1 text-2xl">{pronunciation.title}</h2>
        <p className="mt-2 max-w-3xl text-muted">{pronunciation.explanation}</p>
        <ul className="mt-5 space-y-3">
          {pronunciation.drills.map((d) => (
            <li key={d.text} className="card space-y-3 !p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg">{d.text}</p>
                  <p className="font-mono text-sm text-gold">{d.hint}</p>
                </div>
                <div className="flex gap-2">
                  <ListenButton text={d.text} id={`drill-${d.text}`} />
                  <ListenButton text={d.text} id={`drill-slow-${d.text}`} label="Slow" rate={0.7} />
                </div>
              </div>
              <SpeakRecorder lessonId={lessonId} kind="pronunciation" target={d.text} label="Repeat" maxSeconds={15} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
