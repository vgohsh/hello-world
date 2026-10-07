import type { DiffOp } from '../lib/scoring'

export default function DiffView({ ops }: { ops: DiffOp[] }) {
  return (
    <p className="leading-8">
      {ops.map((op, i) => {
        switch (op.type) {
          case 'match':
            return <span key={i} className="mr-1.5 text-good">{op.word}</span>
          case 'missing':
            return (
              <span key={i} className="mr-1.5 rounded bg-bad/15 px-1 text-bad line-through" title="Missing word">
                {op.word}
              </span>
            )
          case 'wrong':
            return (
              <span key={i} className="mr-1.5 rounded bg-warn/15 px-1 text-warn" title={`Heard "${op.actual}"`}>
                {op.expected} <span className="text-xs opacity-80">(heard “{op.actual}”)</span>
              </span>
            )
          case 'extra':
            return (
              <span key={i} className="mr-1.5 text-xs text-muted italic" title="Extra word">
                +{op.word}
              </span>
            )
        }
      })}
      <span className="sr-only">
        Green words were correct, crossed-out words were missing, orange words were different.
      </span>
    </p>
  )
}
