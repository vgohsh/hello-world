import type { LessonContent } from '../../types/lesson'
import ListenButton from '../../components/ListenButton'

export default function LearnTab({ content }: { content: LessonContent }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <article className="card space-y-4">
        <h2 className="h-serif text-2xl">The lesson</h2>
        {content.explanation.map((p, i) => (
          <p key={i} className="leading-relaxed text-ink/90">{p}</p>
        ))}
        <ListenButton text={content.explanation.join(' ')} id="explanation" label="Listen to the lesson" />
      </article>
      <aside className="card">
        <h2 className="h-serif text-2xl">Vocabulary</h2>
        <dl className="mt-4 space-y-4">
          {content.vocabulary.map((v) => (
            <div key={v.word} className="border-b border-line pb-3 last:border-0">
              <dt className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gold">{v.word}</span>
                <ListenButton text={`${v.word}. ${v.example}`} id={`vocab-${v.word}`} compact />
              </dt>
              <dd className="mt-1 text-sm">{v.meaning}</dd>
              <dd className="mt-1 text-sm text-muted italic">“{v.example}”</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  )
}
