import type { LessonContent } from '../../types/lesson'
import ListenButton from '../../components/ListenButton'

export default function PhrasesTab({ content }: { content: LessonContent }) {
  return (
    <div>
      <h2 className="h-serif text-2xl">Key phrases</h2>
      <p className="mt-1 text-sm text-muted">Listen to each example, then say it out loud two or three times.</p>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {content.keyPhrases.map((k) => (
          <li key={k.phrase} className="card flex items-start justify-between gap-3 !p-4">
            <div>
              <p className="font-semibold text-gold">{k.phrase}</p>
              <p className="mt-1">{k.example}</p>
              {k.note && <p className="mt-1 text-xs text-muted">{k.note}</p>}
            </div>
            <ListenButton text={k.example} id={`phrase-${k.phrase}`} compact />
          </li>
        ))}
      </ul>
    </div>
  )
}
