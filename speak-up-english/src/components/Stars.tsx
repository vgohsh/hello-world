export default function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-lg" role="img" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'text-gold' : 'text-line'} aria-hidden>
          ★
        </span>
      ))}
    </span>
  )
}
