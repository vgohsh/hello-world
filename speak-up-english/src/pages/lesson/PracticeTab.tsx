import { useState } from 'react'
import type { LessonContent } from '../../types/lesson'
import ListenButton from '../../components/ListenButton'
import SpeakRecorder from '../../components/SpeakRecorder'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { SpeakerIcon } from '../../components/Icons'

export default function PracticeTab({ lessonId, content }: { lessonId: number; content: LessonContent }) {
  return (
    <div className="space-y-10">
      <Shadowing lessonId={lessonId} sentences={content.shadowing} />
      <RolePlaySection lessonId={lessonId} content={content} />
      <FreeSpeaking lessonId={lessonId} content={content} />
    </div>
  )
}

function SectionHead({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="mb-4">
      <p className="eyebrow">{step}</p>
      <h2 className="h-serif mt-1 text-2xl">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">{text}</p>
    </div>
  )
}

function Shadowing({ lessonId, sentences }: { lessonId: number; sentences: string[] }) {
  return (
    <section>
      <SectionHead step="Activity A" title="Shadowing" text="Listen to the sentence, then repeat it with the same rhythm and melody. We compare your words with the model." />
      <ol className="space-y-3">
        {sentences.map((s, i) => (
          <li key={s} className="card space-y-3 !p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg">
                <span className="mr-2 text-sm text-muted">{i + 1}.</span>
                {s}
              </p>
              <ListenButton text={s} id={`shadow-${i}`} />
            </div>
            <SpeakRecorder lessonId={lessonId} kind="shadowing" target={s} label="Repeat" maxSeconds={20} />
          </li>
        ))}
      </ol>
    </section>
  )
}

function RolePlaySection({ lessonId, content }: { lessonId: number; content: LessonContent }) {
  const rp = content.rolePlay
  const [step, setStep] = useState(0)
  const [answered, setAnswered] = useState(false)
  const tts = useSpeechSynthesis()
  const turn = rp.turns[step]
  const finished = step >= rp.turns.length

  const next = () => {
    setAnswered(false)
    setStep((s) => s + 1)
  }

  return (
    <section>
      <SectionHead step="Activity B" title={`Role-play: ${rp.title}`} text={rp.situation} />
      <div className="card space-y-4">
        <div className="flex items-center gap-2" aria-label={`Turn ${Math.min(step + 1, rp.turns.length)} of ${rp.turns.length}`}>
          {rp.turns.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-gold' : i === step ? 'bg-gold/50' : 'bg-surface-2'}`} />
          ))}
        </div>

        {finished ? (
          <div className="space-y-3 text-center">
            <p className="h-serif text-2xl">Role-play complete 🎉</p>
            <p className="text-muted">Try it again and use different phrases this time.</p>
            <button type="button" className="btn-ghost" onClick={() => setStep(0)}>Start again</button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold" aria-hidden>
                <SpeakerIcon width={18} height={18} />
              </span>
              <div className="flex-1 rounded-2xl rounded-tl-sm bg-surface-2 p-4">
                <p className="text-xs text-muted">They say:</p>
                <p className="mt-1 text-lg">{turn.prompt}</p>
                <div className="mt-3">
                  <ListenButton text={turn.prompt} id={`rp-${step}`} voiceIndex={1} />
                </div>
              </div>
            </div>
            <div className="border-l-2 border-gold pl-4">
              <p className="mb-2 text-sm font-medium">Your turn. Answer out loud:</p>
              <SpeakRecorder key={step} lessonId={lessonId} kind="roleplay" label="Answer" maxSeconds={45} onDone={() => setAnswered(true)} />
              {!answered && (
                <button type="button" className="mt-2 text-xs text-muted underline-offset-4 hover:underline" onClick={() => setAnswered(true)}>
                  Show suggested answers
                </button>
              )}
            </div>
            {answered && (
              <div className="rounded-xl bg-gold-soft p-4">
                <p className="text-sm font-semibold text-gold">Suggested answers</p>
                <ul className="mt-2 space-y-2">
                  {turn.suggestions.map((s) => (
                    <li key={s} className="flex items-start justify-between gap-2">
                      <span>“{s}”</span>
                      <ListenButton text={s} id={`rps-${s}`} compact />
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-gold mt-4" onClick={() => { tts.stop(); next() }}>
                  {step + 1 < rp.turns.length ? 'Next turn →' : 'Finish'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function FreeSpeaking({ lessonId, content }: { lessonId: number; content: LessonContent }) {
  const f = content.freeSpeaking
  return (
    <section>
      <SectionHead step="Activity C" title="Free speaking" text={`Speak for ${f.minSeconds}–${f.maxSeconds} seconds. We will measure your pace, filler words and pauses.`} />
      <div className="card space-y-4">
        <p className="text-lg">{f.prompt}</p>
        <ul className="flex flex-wrap gap-2">
          {f.tips.map((t) => (
            <li key={t} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">{t}</li>
          ))}
        </ul>
        <SpeakRecorder lessonId={lessonId} kind="free" label="Start speaking" minSeconds={f.minSeconds} maxSeconds={f.maxSeconds} />
      </div>
    </section>
  )
}
